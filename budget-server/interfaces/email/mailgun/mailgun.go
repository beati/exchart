package mailgun

import (
	"context"
	"errors"
	"fmt"
	"net/url"

	"bitbucket.org/beati/budget/budget-server/interfaces/httpclient"
	"bitbucket.org/beati/budget/budget-server/usecases"
)

// Mailgun implements usecase.Mailer.
type Mailgun struct {
	domain string
	apiKey string
	from   string
}

// New returns a new Mailgun
func New(apiKey, domain, name, from string) *Mailgun {
	return &Mailgun{
		domain: domain,
		apiKey: apiKey,
		from:   fmt.Sprintf("%s <%s@%s>", name, from, domain),
	}
}

// Send implements usecase.Mailer.
func (mg *Mailgun) Send(ctx context.Context, mail *usecases.Mail) error {
	target := url.URL{
		Scheme: "https",
		User:   url.UserPassword("api", mg.apiKey),
		Host:   "api.mailgun.net",
		Path:   "/v3/" + mg.domain + "/messages",
	}
	resp, err := httpclient.PostForm(ctx, target.String(), url.Values{
		"from":    {mg.from},
		"to":      mail.To,
		"subject": {mail.Subject},
		"html":    {mail.Text},
	})
	if err != nil {
		return err
	}
	err = resp.Body.Close()
	if err != nil {
		return err
	}

	if resp.StatusCode != 200 {
		return errors.New("mailgun: " + resp.Status)
	}
	return nil
}
