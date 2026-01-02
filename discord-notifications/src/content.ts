/**
 * Discord Notifications Extension - Translation Content
 * Supports: en, es, ro, pt-BR, da, zh-CN, zh-TW (matching main app)
 */

export const discordContent = {
  // Navigation
  nav: {
    title: {
      en: 'Discord',
      es: 'Discord',
      ro: 'Discord',
      'pt-BR': 'Discord',
      da: 'Discord',
      'zh-CN': 'Discord',
      'zh-TW': 'Discord',
    },
  },

  // Page Header
  page: {
    title: {
      en: 'Discord Notifications',
      es: 'Notificaciones de Discord',
      ro: 'Notificări Discord',
      'pt-BR': 'Notificações do Discord',
      da: 'Discord-notifikationer',
      'zh-CN': 'Discord 通知',
      'zh-TW': 'Discord 通知',
    },
    description: {
      en: 'Configure Discord webhooks to receive notifications about your game server',
      es: 'Configura webhooks de Discord para recibir notificaciones sobre tu servidor de juegos',
      ro: 'Configurați webhook-uri Discord pentru a primi notificări despre serverul dvs. de jocuri',
      'pt-BR': 'Configure webhooks do Discord para receber notificações sobre seu servidor de jogos',
      da: 'Konfigurer Discord-webhooks for at modtage notifikationer om din spilserver',
      'zh-CN': '配置 Discord Webhook 以接收有关您游戏服务器的通知',
      'zh-TW': '設定 Discord Webhook 以接收有關您遊戲伺服器的通知',
    },
  },

  // Configuration Card
  config: {
    title: {
      en: 'Webhook Configuration',
      es: 'Configuración de Webhook',
      ro: 'Configurare Webhook',
      'pt-BR': 'Configuração do Webhook',
      da: 'Webhook-konfiguration',
      'zh-CN': 'Webhook 配置',
      'zh-TW': 'Webhook 設定',
    },
    description: {
      en: 'Configure Discord webhooks to receive notifications about your game server events.',
      es: 'Configura webhooks de Discord para recibir notificaciones sobre los eventos de tu servidor de juegos.',
      ro: 'Configurați webhook-uri Discord pentru a primi notificări despre evenimentele serverului dvs. de jocuri.',
      'pt-BR': 'Configure webhooks do Discord para receber notificações sobre os eventos do seu servidor de jogos.',
      da: 'Konfigurer Discord-webhooks for at modtage notifikationer om dine spilserver-hændelser.',
      'zh-CN': '配置 Discord Webhook 以接收有关您游戏服务器事件的通知。',
      'zh-TW': '設定 Discord Webhook 以接收有關您遊戲伺服器事件的通知。',
    },
  },

  // Form Fields
  form: {
    webhookUrl: {
      en: 'Discord Webhook URL',
      es: 'URL del Webhook de Discord',
      ro: 'URL Webhook Discord',
      'pt-BR': 'URL do Webhook do Discord',
      da: 'Discord Webhook-URL',
      'zh-CN': 'Discord Webhook URL',
      'zh-TW': 'Discord Webhook URL',
    },
    webhookPlaceholder: {
      en: 'https://discord.com/api/webhooks/...',
      es: 'https://discord.com/api/webhooks/...',
      ro: 'https://discord.com/api/webhooks/...',
      'pt-BR': 'https://discord.com/api/webhooks/...',
      da: 'https://discord.com/api/webhooks/...',
      'zh-CN': 'https://discord.com/api/webhooks/...',
      'zh-TW': 'https://discord.com/api/webhooks/...',
    },
    webhookHint: {
      en: 'Enter the full webhook URL from your Discord server integration settings.',
      es: 'Ingresa la URL completa del webhook desde la configuración de integraciones de tu servidor de Discord.',
      ro: 'Introduceți URL-ul complet al webhook-ului din setările de integrare ale serverului Discord.',
      'pt-BR': 'Insira a URL completa do webhook das configurações de integração do seu servidor Discord.',
      da: 'Indtast den fulde webhook-URL fra dine Discord-serverintegreringsindstillinger.',
      'zh-CN': '从您的 Discord 服务器集成设置中输入完整的 Webhook URL。',
      'zh-TW': '從您的 Discord 伺服器整合設定中輸入完整的 Webhook URL。',
    },
  },

  // Buttons
  buttons: {
    save: {
      en: 'Save Webhook',
      es: 'Guardar Webhook',
      ro: 'Salvați Webhook',
      'pt-BR': 'Salvar Webhook',
      da: 'Gem webhook',
      'zh-CN': '保存 Webhook',
      'zh-TW': '儲存 Webhook',
    },
    test: {
      en: 'Send Test Message',
      es: 'Enviar Mensaje de Prueba',
      ro: 'Trimiteți Mesaj de Test',
      'pt-BR': 'Enviar Mensagem de Teste',
      da: 'Send testbesked',
      'zh-CN': '发送测试消息',
      'zh-TW': '傳送測試訊息',
    },
    remove: {
      en: 'Remove',
      es: 'Eliminar',
      ro: 'Eliminați',
      'pt-BR': 'Remover',
      da: 'Fjern',
      'zh-CN': '移除',
      'zh-TW': '移除',
    },
  },

  // Active Integrations
  integrations: {
    title: {
      en: 'Active Integrations',
      es: 'Integraciones Activas',
      ro: 'Integrări Active',
      'pt-BR': 'Integrações Ativas',
      da: 'Aktive integrationer',
      'zh-CN': '活跃集成',
      'zh-TW': '活躍整合',
    },
    active: {
      en: 'Active',
      es: 'Activo',
      ro: 'Activ',
      'pt-BR': 'Ativo',
      da: 'Aktiv',
      'zh-CN': '活跃',
      'zh-TW': '活躍',
    },
  },

  // Messages
  messages: {
    success: {
      en: 'Webhook saved successfully!',
      es: '¡Webhook guardado exitosamente!',
      ro: 'Webhook salvat cu succes!',
      'pt-BR': 'Webhook salvo com sucesso!',
      da: 'Webhook gemt!',
      'zh-CN': 'Webhook 保存成功！',
      'zh-TW': 'Webhook 儲存成功！',
    },
    removed: {
      en: 'Webhook removed successfully',
      es: 'Webhook eliminado exitosamente',
      ro: 'Webhook eliminat cu succes',
      'pt-BR': 'Webhook removido com sucesso',
      da: 'Webhook fjernet',
      'zh-CN': 'Webhook 已成功移除',
      'zh-TW': 'Webhook 已成功移除',
    },
    testSent: {
      en: 'Test message sent to Discord!',
      es: '¡Mensaje de prueba enviado a Discord!',
      ro: 'Mesaj de test trimis la Discord!',
      'pt-BR': 'Mensagem de teste enviada para o Discord!',
      da: 'Testbesked sendt til Discord!',
      'zh-CN': '测试消息已发送到 Discord！',
      'zh-TW': '測試訊息已傳送到 Discord！',
    },
  },

  // Errors
  errors: {
    invalidUrl: {
      en: 'Invalid Discord webhook URL',
      es: 'URL de webhook de Discord inválida',
      ro: 'URL webhook Discord invalid',
      'pt-BR': 'URL de webhook do Discord inválida',
      da: 'Ugyldig Discord webhook-URL',
      'zh-CN': '无效的 Discord Webhook URL',
      'zh-TW': '無效的 Discord Webhook URL',
    },
    saveFailed: {
      en: 'Failed to save webhook',
      es: 'Error al guardar el webhook',
      ro: 'Nu s-a putut salva webhook-ul',
      'pt-BR': 'Falha ao salvar o webhook',
      da: 'Kunne ikke gemme webhook',
      'zh-CN': '保存 Webhook 失败',
      'zh-TW': '儲存 Webhook 失敗',
    },
    removeFailed: {
      en: 'Failed to remove webhook',
      es: 'Error al eliminar el webhook',
      ro: 'Nu s-a putut elimina webhook-ul',
      'pt-BR': 'Falha ao remover o webhook',
      da: 'Kunne ikke fjerne webhook',
      'zh-CN': '移除 Webhook 失败',
      'zh-TW': '移除 Webhook 失敗',
    },
    testFailed: {
      en: 'Failed to send test message',
      es: 'Error al enviar mensaje de prueba',
      ro: 'Nu s-a putut trimite mesajul de test',
      'pt-BR': 'Falha ao enviar mensagem de teste',
      da: 'Kunne ikke sende testbesked',
      'zh-CN': '发送测试消息失败',
      'zh-TW': '傳送測試訊息失敗',
    },
  },

  // Confirmation Dialog
  confirm: {
    removeTitle: {
      en: 'Remove Webhook',
      es: 'Eliminar Webhook',
      ro: 'Eliminați Webhook',
      'pt-BR': 'Remover Webhook',
      da: 'Fjern webhook',
      'zh-CN': '移除 Webhook',
      'zh-TW': '移除 Webhook',
    },
    removeMessage: {
      en: 'Are you sure you want to remove this Discord webhook? You will stop receiving notifications in this channel.',
      es: '¿Estás seguro de que quieres eliminar este webhook de Discord? Dejarás de recibir notificaciones en este canal.',
      ro: 'Sigur doriți să eliminați acest webhook Discord? Nu veți mai primi notificări pe acest canal.',
      'pt-BR': 'Tem certeza de que deseja remover este webhook do Discord? Você deixará de receber notificações neste canal.',
      da: 'Er du sikker på, at du vil fjerne denne Discord-webhook? Du stopper med at modtage notifikationer i denne kanal.',
      'zh-CN': '您确定要移除此 Discord Webhook 吗？您将停止在此频道接收通知。',
      'zh-TW': '您確定要移除此 Discord Webhook 嗎？您將停止在此頻道接收通知。',
    },
  },

  // Info Box
  info: {
    title: {
      en: 'About Discord Webhooks',
      es: 'Acerca de los Webhooks de Discord',
      ro: 'Despre Webhook-urile Discord',
      'pt-BR': 'Sobre Webhooks do Discord',
      da: 'Om Discord-webhooks',
      'zh-CN': '关于 Discord Webhook',
      'zh-TW': '關於 Discord Webhook',
    },
    description: {
      en: 'Webhook URLs are unique to each Discord channel. You can create them in your Discord server settings under Integrations > Webhooks. Once configured, events like server start, stop, and crashes will be sent directly to your channel.',
      es: 'Las URLs de webhook son únicas para cada canal de Discord. Puedes crearlas en la configuración de tu servidor de Discord en Integraciones > Webhooks. Una vez configuradas, eventos como inicio, detención y fallos del servidor se enviarán directamente a tu canal.',
      ro: 'URL-urile webhook sunt unice pentru fiecare canal Discord. Le puteți crea în setările serverului Discord la Integrări > Webhooks. Odată configurate, evenimente precum pornirea, oprirea și blocările serverului vor fi trimise direct pe canal.',
      'pt-BR': 'As URLs de webhook são exclusivas para cada canal do Discord. Você pode criá-las nas configurações do seu servidor Discord em Integrações > Webhooks. Uma vez configurados, eventos como início, parada e falhas do servidor serão enviados diretamente para o seu canal.',
      da: 'Webhook-URL\'er er unikke for hver Discord-kanal. Du kan oprette dem i dine Discord-serverindstillinger under Integrationer > Webhooks. Når de er konfigureret, vil hændelser som serverstart, -stop og -nedbrud blive sendt direkte til din kanal.',
      'zh-CN': 'Webhook URL 对每个 Discord 频道都是唯一的。您可以在 Discord 服务器设置的"集成 > Webhook"中创建它们。配置完成后，服务器启动、停止和崩溃等事件将直接发送到您的频道。',
      'zh-TW': 'Webhook URL 對每個 Discord 頻道都是唯一的。您可以在 Discord 伺服器設定的「整合 > Webhook」中建立它們。設定完成後，伺服器啟動、停止和當機等事件將直接傳送到您的頻道。',
    },
  },
};
