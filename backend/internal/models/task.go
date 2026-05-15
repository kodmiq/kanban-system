package models

type Task struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Status      string   `json:"status"` // To Do, In Progress, Done
	Priority    string   `json:"priority"`
	Tags        []string `json:"tags"`
	Assignee    string   `json:"assignee"`
}