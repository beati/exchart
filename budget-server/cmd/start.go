package cmd

import (
	"crypto/tls"
	"crypto/x509"
	"errors"
	"io/ioutil"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi"
	"github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"golang.org/x/crypto/acme/autocert"

	"bitbucket.org/beati/budget/budget-server/assets"
	"bitbucket.org/beati/budget/budget-server/domain"
)

// startCmd represents the start command
var startCmd = &cobra.Command{
	Use:          "start",
	Short:        "Start the server",
	SilenceUsage: true,
	RunE: func(cmd *cobra.Command, args []string) error {
		initConfig()

		var idObfuscationKey string
		err := viper.UnmarshalKey("IDObfuscationKey", &idObfuscationKey)
		if err != nil {
			return err
		}
		err = domain.InitIDObfuscation(idObfuscationKey)
		if err != nil {
			return err
		}

		serverConfig := struct {
			Addr               string
			HTTPSRedirectAddr  string
			Host               string
			Certificates       certificateConfig
			BehindReverseProxy bool
		}{}
		err = viper.UnmarshalKey("Server", &serverConfig)
		if err != nil {
			return err
		}

		logger := logrus.New()
		logger.Formatter = &logrus.JSONFormatter{}

		router := chi.NewRouter()
		assetsHandler := assets.Handler("/")
		router.Mount("/", assetsHandler)

		if serverConfig.HTTPSRedirectAddr != "" {
			startRedirectToHTTPS(serverConfig.HTTPSRedirectAddr, serverConfig.Host, logger)
		}

		tlsConfig, err := createTLSConfig(serverConfig.Certificates)
		if err != nil {
			return err
		}

		server := http.Server{
			Addr: serverConfig.Addr,
			Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				switch r.Host {
				case serverConfig.Host:
					router.ServeHTTP(w, r)
				default:
					http.Redirect(w, r, "https://"+serverConfig.Host, http.StatusMovedPermanently)
				}
			}),
			ReadTimeout:  20 * time.Second,
			WriteTimeout: 20 * time.Second,
			IdleTimeout:  120 * time.Second,
			TLSConfig:    tlsConfig,
			ErrorLog:     log.New(logger.Writer(), "", 0),
		}

		logger.WithFields(logrus.Fields{
			"addr": serverConfig.Addr,
		}).Info("Server starts listening")
		return server.ListenAndServeTLS("", "")
	},
}

func init() {
	rootCmd.AddCommand(startCmd)
}

type certificateConfig struct {
	Mode   string
	Static struct {
		Cert string
		Key  string
	}
	Auto struct {
		ContactEmail        string
		CertificateCacheDir string
		Hosts               []string
	}
	Client string
}

func createTLSConfig(certConfig certificateConfig) (*tls.Config, error) {
	var err error

	tlsConfig := &tls.Config{
		MinVersion:               tls.VersionTLS12,
		PreferServerCipherSuites: true,
		CurvePreferences: []tls.CurveID{
			tls.CurveP256,
			tls.X25519,
		},
		CipherSuites: []uint16{
			tls.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,
			tls.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,
			tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
			tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
			tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
		},
	}
	switch certConfig.Mode {
	case "static":
		cert := certConfig.Static.Cert
		key := certConfig.Static.Key
		tlsConfig.Certificates = make([]tls.Certificate, 1)
		tlsConfig.Certificates[0], err = tls.LoadX509KeyPair(cert, key)
		if err != nil {
			return nil, err
		}
	case "auto":
		m := autocert.Manager{
			Email:      certConfig.Auto.ContactEmail,
			Prompt:     autocert.AcceptTOS,
			HostPolicy: autocert.HostWhitelist(certConfig.Auto.Hosts...),
			Cache:      autocert.DirCache(certConfig.Auto.CertificateCacheDir),
		}
		tlsConfig.GetCertificate = m.GetCertificate
	default:
		return nil, errors.New("certificates mode is neiter static nor auto")
	}
	if certConfig.Client != "" {
		clientCert, err := ioutil.ReadFile(certConfig.Client)
		if err != nil {
			return nil, err
		}
		clientCAs := x509.NewCertPool()
		clientCAs.AppendCertsFromPEM(clientCert)
		tlsConfig.ClientAuth = tls.RequireAndVerifyClientCert
		tlsConfig.ClientCAs = clientCAs
	}

	return tlsConfig, nil
}

func startRedirectToHTTPS(redirectAddr string, host string, logger *logrus.Logger) {
	go func() {
		server := http.Server{
			Addr: redirectAddr,
			Handler: http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				http.Redirect(w, r, "https://"+host+r.RequestURI, http.StatusMovedPermanently)
			}),
			ReadTimeout:  20 * time.Second,
			WriteTimeout: 20 * time.Second,
			IdleTimeout:  120 * time.Second,
			ErrorLog:     log.New(logger.Writer(), "", 0),
		}
		err := server.ListenAndServe()
		logger.Fatal(err)
	}()
}
