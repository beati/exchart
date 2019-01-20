package usecases

import "context"

// A Mail represents an email.
type Mail struct {
	To      []string
	Subject string
	Text    string
}

// A Mailer interface is used to send email.
type Mailer interface {
	Send(ctx context.Context, mail *Mail) error
}
