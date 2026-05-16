package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"github.com/dgrijalva/jwt-go"
	"github.com/kodmiq/kanban-system/backend/internal/broker"
	"github.com/kodmiq/kanban-system/backend/internal/models"
)

func main() {
	dsn := "user=user password=password dbname=kanban_db sslmode=disable host=localhost"
	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatalln("Failed to connect to database:", err)
	}
	log.Println("Successfully connected to PostgreSQL")

	r := gin.Default()

	r.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
        c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }

        c.Next()
    })

	r.GET("/tasks", func(c *gin.Context) {
		tasks := make([]models.Task, 0) 
    
    	err := db.Select(&tasks, "SELECT * FROM tasks ORDER BY created_at DESC")
    	if err != nil {
        	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        	return
    	}
    	c.JSON(http.StatusOK, tasks)
	})


	r.POST("/tasks", func(c *gin.Context) {
		var newTask models.Task
		if err := c.ShouldBindJSON(&newTask); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Validation failed: Title is required, and Status/Priority must be valid",
            	"details": err.Error(),
			})
			return
		}

		if newTask.ID == "" {
			newTask.ID = "TASK-" + time.Now().Format("0599")
		}
		if newTask.Status == "" {
        	newTask.Status = "To Do"
    	}
    	if newTask.Priority == "" {
        	newTask.Priority = "Medium"
		}
		newTask.CreatedAt = time.Now()

		query := `INSERT INTO tasks (id, title, description, status, priority, assignee, created_at, deadline) 
				  VALUES (:id, :title, :description, :status, :priority, :assignee, :created_at, :deadline)`
		
		_, err = db.NamedExec(query, newTask)
		if err != nil {
			c.JSON(http.StatusConflict, gin.H{"error": "Task with this ID already exists"})
        	return
		}

		broker.SendTaskUpdate("CREATED: Task " + newTask.ID + " added to the board")
		c.JSON(http.StatusCreated, newTask)
	})

	r.PUT("/tasks/:id", func(c *gin.Context) {
		id := c.Param("id")
		var input struct {
			Status string `json:"status" binding:"required,oneof='To Do' 'In Progress' 'Done'"`
		}
		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Invalid status. Allowed values: 'To Do', 'In Progress', 'Done'",
			})
			return
		}

		_, err = db.Exec("UPDATE tasks SET status=$1 WHERE id=$2", input.Status, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Update failed"})
			return
		}

		broker.SendTaskUpdate("MOVED: Task " + id + " status changed to " + input.Status)
		c.JSON(http.StatusOK, gin.H{"message": "Task updated successfully"})
	})

	r.DELETE("/tasks/:id", func(c *gin.Context) {
		id := c.Param("id")
		_, err = db.Exec("DELETE FROM tasks WHERE id=$1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Delete failed"})
			return
		}

		broker.SendTaskUpdate("DELETED: Task " + id + " removed from the system")
		c.Status(http.StatusNoContent)
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok", "time": time.Now().Format(time.RFC3339)})
	})

var jwtKey = []byte("my_secret_key")


// 1. ЭНДПОИНТ РЕГИСТРАЦИИ
r.POST("/register", func(c *gin.Context) {
    var input models.User
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Username and password are required"})
        return
    }

    // Хэшируем пароль
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
        return
    }

    // Сохраняем в БД
    query := "INSERT INTO users (username, password_hash) VALUES ($1, $2)"
    _, err = db.Exec(query, input.Username, string(hashedPassword))
    if err != nil {
        c.JSON(http.StatusConflict, gin.H{"error": "Username already exists"})
        return
    }

    // Отправляем уведомление в RabbitMQ о новом пользователе
    broker.SendTaskUpdate("SYSTEM: New user registered: " + input.Username)

    c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
})

// 2. ЭНДПОИНТ ЛОГИНА (ВХОДА)
r.POST("/login", func(c *gin.Context) {
    var input models.User
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input"})
        return
    }

    var foundUser models.User
    query := "SELECT id, username, password_hash FROM users WHERE username = $1"
    err := db.Get(&foundUser, query, input.Username)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
        return
    }

    // Сверяем хэш пароля
    err = bcrypt.CompareHashAndPassword([]byte(foundUser.PasswordHash), []byte(input.Password))
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
        return
    }

    // Генерируем JWT токен на 24 часа
    expirationTime := time.Now().Add(24 * time.Hour)
    claims := &jwt.StandardClaims{
        Subject:   foundUser.Username,
        ExpiresAt: expirationTime.Unix(),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString(jwtKey)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
        return
    }

    // Возвращаем токен и имя пользователя фронтенду
    c.JSON(http.StatusOK, gin.H{
        "token":    tokenString,
        "username": foundUser.Username,
    })
})

	go broker.ListenForUpdates()
	log.Println("Backend server is running on http://localhost:8080")
	r.Run(":8080")
}