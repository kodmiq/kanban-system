package main

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/kodmiq/kanban-system/backend/internal/broker"
	"github.com/kodmiq/kanban-system/backend/internal/models" 
)

func main() {
	dsn := "user=user password=password dbname=kanban_db sslmode=disable host=localhost"
	db, err := sqlx.Connect("postgres", dsn)
	if err != nil {
		log.Fatalln("Base connection failed:", err)
	}

	r := gin.Default()

	r.GET("/tasks", func(c *gin.Context) {
		var tasks []models.Task
		err := db.Select(&tasks, "SELECT * FROM tasks")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, tasks)
	})

	// В импорты добавь: "github.com/kodmiq/canban-system/backend/internal/broker"

r.PUT("/tasks/:id", func(c *gin.Context) {
    id := c.Param("id")
    var input struct {
        Status string `json:"status"`
    }
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(400, gin.H{"error": err.Error()})
        return
    }

    // Обновляем в базе
    _, err = db.Exec("UPDATE tasks SET status=$1 WHERE id=$2", input.Status, id)
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    // Оповещаем всех через RabbitMQ!
    broker.SendTaskUpdate("Task " + id + " moved to " + input.Status)

    c.JSON(200, gin.H{"message": "Task updated and notification sent"})
	})

	r.Run(":8080")
}