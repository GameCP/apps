/**
 * Discord Notifications Extension - Translation Content
 * Supports: en, es, fr, de, pt
 */

export const discordContent = {
  // Navigation
  nav: {
    title: {
      en: 'Discord',
      es: 'Discord',
      fr: 'Discord',
      de: 'Discord',
      pt: 'Discord',
    },
  },

  // Page Header
  page: {
    title: {
      en: 'Discord Notifications',
      es: 'Notificaciones de Discord',
      fr: 'Notifications Discord',
      de: 'Discord-Benachrichtigungen',
      pt: 'Notificações do Discord',
    },
    description: {
      en: 'Configure Discord webhooks to receive notifications about your game server',
      es: 'Configura webhooks de Discord para recibir notificaciones sobre tu servidor de juegos',
      fr: 'Configurez les webhooks Discord pour recevoir des notifications sur votre serveur de jeu',
      de: 'Konfigurieren Sie Discord-Webhooks, um Benachrichtigungen über Ihren Spielserver zu erhalten',
      pt: 'Configure webhooks do Discord para receber notificações sobre seu servidor de jogos',
    },
  },

  // Configuration Card
  config: {
    title: {
      en: 'Webhook Configuration',
      es: 'Configuración de Webhook',
      fr: 'Configuration du Webhook',
      de: 'Webhook-Konfiguration',
      pt: 'Configuração do Webhook',
    },
    description: {
      en: 'Configure Discord webhooks to receive notifications about your game server events.',
      es: 'Configura webhooks de Discord para recibir notificaciones sobre los eventos de tu servidor de juegos.',
      fr: 'Configurez les webhooks Discord pour recevoir des notifications sur les événements de votre serveur de jeu.',
      de: 'Konfigurieren Sie Discord-Webhooks, um Benachrichtigungen über Ihre Spielserver-Ereignisse zu erhalten.',
      pt: 'Configure webhooks do Discord para receber notificações sobre os eventos do seu servidor de jogos.',
    },
  },

  // Form Fields
  form: {
    webhookUrl: {
      en: 'Discord Webhook URL',
      es: 'URL del Webhook de Discord',
      fr: 'URL du Webhook Discord',
      de: 'Discord-Webhook-URL',
      pt: 'URL do Webhook do Discord',
    },
    webhookPlaceholder: {
      en: 'https://discord.com/api/webhooks/...',
      es: 'https://discord.com/api/webhooks/...',
      fr: 'https://discord.com/api/webhooks/...',
      de: 'https://discord.com/api/webhooks/...',
      pt: 'https://discord.com/api/webhooks/...',
    },
    webhookHint: {
      en: 'Enter the full webhook URL from your Discord server integration settings.',
      es: 'Ingresa la URL completa del webhook desde la configuración de integraciones de tu servidor de Discord.',
      fr: 'Entrez l\'URL complète du webhook depuis les paramètres d\'intégration de votre serveur Discord.',
      de: 'Geben Sie die vollständige Webhook-URL aus den Integrationseinstellungen Ihres Discord-Servers ein.',
      pt: 'Insira a URL completa do webhook das configurações de integração do seu servidor Discord.',
    },
  },

  // Buttons
  buttons: {
    save: {
      en: 'Save Webhook',
      es: 'Guardar Webhook',
      fr: 'Enregistrer le Webhook',
      de: 'Webhook speichern',
      pt: 'Salvar Webhook',
    },
    test: {
      en: 'Send Test Message',
      es: 'Enviar Mensaje de Prueba',
      fr: 'Envoyer un Message de Test',
      de: 'Testnachricht senden',
      pt: 'Enviar Mensagem de Teste',
    },
    remove: {
      en: 'Remove',
      es: 'Eliminar',
      fr: 'Supprimer',
      de: 'Entfernen',
      pt: 'Remover',
    },
  },

  // Active Integrations
  integrations: {
    title: {
      en: 'Active Integrations',
      es: 'Integraciones Activas',
      fr: 'Intégrations Actives',
      de: 'Aktive Integrationen',
      pt: 'Integrações Ativas',
    },
    active: {
      en: 'Active',
      es: 'Activo',
      fr: 'Actif',
      de: 'Aktiv',
      pt: 'Ativo',
    },
  },

  // Messages
  messages: {
    success: {
      en: 'Webhook saved successfully!',
      es: '¡Webhook guardado exitosamente!',
      fr: 'Webhook enregistré avec succès!',
      de: 'Webhook erfolgreich gespeichert!',
      pt: 'Webhook salvo com sucesso!',
    },
    removed: {
      en: 'Webhook removed successfully',
      es: 'Webhook eliminado exitosamente',
      fr: 'Webhook supprimé avec succès',
      de: 'Webhook erfolgreich entfernt',
      pt: 'Webhook removido com sucesso',
    },
    testSent: {
      en: 'Test message sent to Discord!',
      es: '¡Mensaje de prueba enviado a Discord!',
      fr: 'Message de test envoyé à Discord!',
      de: 'Testnachricht an Discord gesendet!',
      pt: 'Mensagem de teste enviada para o Discord!',
    },
  },

  // Errors
  errors: {
    invalidUrl: {
      en: 'Invalid Discord webhook URL',
      es: 'URL de webhook de Discord inválida',
      fr: 'URL de webhook Discord invalide',
      de: 'Ungültige Discord-Webhook-URL',
      pt: 'URL de webhook do Discord inválida',
    },
    saveFailed: {
      en: 'Failed to save webhook',
      es: 'Error al guardar el webhook',
      fr: 'Échec de l\'enregistrement du webhook',
      de: 'Fehler beim Speichern des Webhooks',
      pt: 'Falha ao salvar o webhook',
    },
    removeFailed: {
      en: 'Failed to remove webhook',
      es: 'Error al eliminar el webhook',
      fr: 'Échec de la suppression du webhook',
      de: 'Fehler beim Entfernen des Webhooks',
      pt: 'Falha ao remover o webhook',
    },
    testFailed: {
      en: 'Failed to send test message',
      es: 'Error al enviar mensaje de prueba',
      fr: 'Échec de l\'envoi du message de test',
      de: 'Fehler beim Senden der Testnachricht',
      pt: 'Falha ao enviar mensagem de teste',
    },
  },

  // Confirmation Dialog
  confirm: {
    removeTitle: {
      en: 'Remove Webhook',
      es: 'Eliminar Webhook',
      fr: 'Supprimer le Webhook',
      de: 'Webhook entfernen',
      pt: 'Remover Webhook',
    },
    removeMessage: {
      en: 'Are you sure you want to remove this Discord webhook? You will stop receiving notifications in this channel.',
      es: '¿Estás seguro de que quieres eliminar este webhook de Discord? Dejarás de recibir notificaciones en este canal.',
      fr: 'Êtes-vous sûr de vouloir supprimer ce webhook Discord? Vous ne recevrez plus de notifications dans ce canal.',
      de: 'Sind Sie sicher, dass Sie diesen Discord-Webhook entfernen möchten? Sie erhalten keine Benachrichtigungen mehr in diesem Kanal.',
      pt: 'Tem certeza de que deseja remover este webhook do Discord? Você deixará de receber notificações neste canal.',
    },
  },

  // Info Box
  info: {
    title: {
      en: 'About Discord Webhooks',
      es: 'Acerca de los Webhooks de Discord',
      fr: 'À propos des Webhooks Discord',
      de: 'Über Discord-Webhooks',
      pt: 'Sobre Webhooks do Discord',
    },
    description: {
      en: 'Webhook URLs are unique to each Discord channel. You can create them in your Discord server settings under Integrations > Webhooks. Once configured, events like server start, stop, and crashes will be sent directly to your channel.',
      es: 'Las URLs de webhook son únicas para cada canal de Discord. Puedes crearlas en la configuración de tu servidor de Discord en Integraciones > Webhooks. Una vez configuradas, eventos como inicio, detención y fallos del servidor se enviarán directamente a tu canal.',
      fr: 'Les URL de webhook sont uniques à chaque canal Discord. Vous pouvez les créer dans les paramètres de votre serveur Discord sous Intégrations > Webhooks. Une fois configurés, les événements tels que le démarrage, l\'arrêt et les plantages du serveur seront envoyés directement à votre canal.',
      de: 'Webhook-URLs sind für jeden Discord-Kanal eindeutig. Sie können sie in Ihren Discord-Servereinstellungen unter Integrationen > Webhooks erstellen. Nach der Konfiguration werden Ereignisse wie Serverstart, -stopp und -abstürze direkt an Ihren Kanal gesendet.',
      pt: 'As URLs de webhook são exclusivas para cada canal do Discord. Você pode criá-las nas configurações do seu servidor Discord em Integrações > Webhooks. Uma vez configurados, eventos como início, parada e falhas do servidor serão enviados diretamente para o seu canal.',
    },
  },
};
