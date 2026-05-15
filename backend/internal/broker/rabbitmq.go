package broker

import (
	"github.com/streadway/amqp"
	"log"
)

func SendTaskUpdate(message string) {
	// Подключаемся к RabbitMQ в Docker
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Println("Failed to connect to RabbitMQ:", err)
		return
	}
	defer conn.Close()

	ch, _ := conn.Channel()
	defer ch.Close()

	q, _ := ch.QueueDeclare("task_updates", false, false, false, false, nil)

	ch.Publish("", q.Name, false, false, amqp.Publishing{
		ContentType: "text/plain",
		Body:        []byte(message),
	})
	log.Printf(" [x] Sent %s", message)
}