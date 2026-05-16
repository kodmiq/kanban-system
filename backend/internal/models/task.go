package models

import "time"

type Task struct {
	ID          string    `json:"id" db:"id"`
	Title       string    `json:"title" db:"title" binding:"required"`
	Description string    `json:"description" db:"description"`
	Status      string    `json:"status" db:"status" binding:"omitempty,oneof='To Do' 'In Progress' 'Done'"`
	Priority    string    `json:"priority" db:"priority" binding:"omitempty,oneof='Low' 'Medium' 'High'"`
	Assignee    string    `json:"assignee" db:"assignee"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	Deadline    *time.Time `json:"deadline" db:"deadline"`
}