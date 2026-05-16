package broker

import (
	"log"
	"github.com/streadway/amqp"
)

// ListenForUpdates запускает бесконечный цикл прослушивания очереди
func ListenForUpdates() {
	conn, err := amqp.Dial("amqp://guest:guest@localhost:5672/")
	if err != nil {
		log.Fatal("Failed to connect to RabbitMQ for consuming:", err)
	}
	defer conn.Close()

	ch, _ := conn.Channel()
	defer ch.Close()

	q, _ := ch.QueueDeclare("task_updates", false, false, false, false, nil)

	msgs, _ := ch.Consume(q.Name, "", true, false, false, false, nil)

	log.Println(" [*] Ожидание уведомлений о задачах. Для выхода нажмите CTRL+C")

	// Читаем сообщения в реальном времени
	for d := range msgs {
		log.Printf(" [!] ПОЛУЧЕНО УВЕДОМЛЕНИЕ: %s", d.Body)
		// Здесь в будущем можно добавить отправку в Telegram или WebSocket
	}
}