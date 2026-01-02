# Extension i18n Support

## Overview

Extensions can use the GameCP i18n system (powered by Intlayer) to provide multi-language support. The `GameCP_SDK` provides access to translation utilities that work seamlessly with the main application's language settings.

## How It Works

### User Language Selection
The extension automatically receives the user's selected language through the GameCP SDK. The language is determined by:
1. User's profile language preference
2. Browser language (if no preference set)
3. Tenant default language
4. System default (English)

### Available in GameCP_SDK

```typescript
declare global {
  interface Window {
    GameCP_SDK: {
      // ... other SDK utilities
      
      // i18n utilities
      useIntl: () => {
        t: (key: string) => string;
        locale: string;
      };
      
      // Or if using Intlayer directly
      t: (translations: Record<string, string>) => string;
      locale: string;
    };
  }
}
```

## Usage in Extensions

### 1. Create Content Dictionary

Create a `content.ts` file in your extension:

```typescript
// src/content.ts
export const discordContent = {
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
  webhookUrl: {
    en: 'Discord Webhook URL',
    es: 'URL del Webhook de Discord',
    fr: 'URL du Webhook Discord',
    de: 'Discord-Webhook-URL',
    pt: 'URL do Webhook do Discord',
  },
  saveButton: {
    en: 'Save Webhook',
    es: 'Guardar Webhook',
    fr: 'Enregistrer le Webhook',
    de: 'Webhook speichern',
    pt: 'Salvar Webhook',
  },
  testButton: {
    en: 'Send Test Message',
    es: 'Enviar Mensaje de Prueba',
    fr: 'Envoyer un Message de Test',
    de: 'Testnachricht senden',
    pt: 'Enviar Mensagem de Teste',
  },
  messages: {
    success: {
      en: 'Webhook saved successfully!',
      es: '¡Webhook guardado exitosamente!',
      fr: 'Webhook enregistré avec succès!',
      de: 'Webhook erfolgreich gespeichert!',
      pt: 'Webhook salvo com sucesso!',
    },
    testSent: {
      en: 'Test message sent to Discord!',
      es: '¡Mensaje de prueba enviado a Discord!',
      fr: 'Message de test envoyé à Discord!',
      de: 'Testnachricht an Discord gesendet!',
      pt: 'Mensagem de teste enviada para o Discord!',
    },
  },
};
```

### 2. Use in UI Components

```typescript
import React from 'react';
import { discordContent } from './content';

export function SettingsPage({ serverId }: SettingsPageProps) {
  // Get translation function from GameCP SDK
  const { t, locale } = window.GameCP_SDK.useIntl();
  
  // Simple translation helper
  const translate = (content: Record<string, string>) => {
    return content[locale] || content.en;
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-xl font-bold">
        {translate(discordContent.title)}
      </h1>
      <p className="text-muted-foreground">
        {translate(discordContent.description)}
      </p>
      
      <label>
        {translate(discordContent.webhookUrl)}
      </label>
      
      <button>
        {translate(discordContent.saveButton)}
      </button>
    </div>
  );
}
```

### 3. Alternative: Inline Translations

For simple cases, you can use inline translations:

```typescript
const { t } = window.GameCP_SDK.useIntl();

<h1>
  {t({
    en: 'Discord Notifications',
    es: 'Notificaciones de Discord',
    fr: 'Notifications Discord',
  })}
</h1>
```

## Supported Languages

Extensions should support the same languages as the main application:
- English (en) - Default
- Spanish (es)
- Romanian (ro)
- Portuguese Brazil (pt-BR)
- Danish (da)
- Chinese Simplified (zh-CN)
- Chinese Traditional (zh-TW)

## Best Practices

### 1. Always Provide English Fallback
```typescript
const text = content[locale] || content.en || 'Fallback text';
```

### 2. Organize Translations by Feature
```typescript
export const content = {
  settings: {
    title: { en: '...', es: '...', fr: '...' },
    description: { en: '...', es: '...', fr: '...' },
  },
  errors: {
    invalidUrl: { en: '...', es: '...', fr: '...' },
    saveFailed: { en: '...', es: '...', fr: '...' },
  },
};
```

### 3. Keep Translations Close to Components
Create a `content.ts` file next to your UI components for easy maintenance.

### 4. Use Consistent Keys
Follow a naming convention for translation keys:
- `title`, `description` for headings
- `button.save`, `button.cancel` for actions
- `message.success`, `message.error` for feedback
- `label.fieldName` for form labels

## Example: Complete Translated Extension

```typescript
// src/content.ts
export const content = {
  nav: {
    title: {
      en: 'Discord',
      es: 'Discord',
      fr: 'Discord',
    },
  },
  page: {
    title: {
      en: 'Discord Notifications',
      es: 'Notificaciones de Discord',
      fr: 'Notifications Discord',
    },
    description: {
      en: 'Configure Discord webhooks to receive notifications',
      es: 'Configura webhooks de Discord para recibir notificaciones',
      fr: 'Configurez les webhooks Discord pour recevoir des notifications',
    },
  },
  form: {
    webhookUrl: {
      en: 'Discord Webhook URL',
      es: 'URL del Webhook de Discord',
      fr: 'URL du Webhook Discord',
    },
    placeholder: {
      en: 'https://discord.com/api/webhooks/...',
      es: 'https://discord.com/api/webhooks/...',
      fr: 'https://discord.com/api/webhooks/...',
    },
    save: {
      en: 'Save Webhook',
      es: 'Guardar Webhook',
      fr: 'Enregistrer le Webhook',
    },
    test: {
      en: 'Send Test Message',
      es: 'Enviar Mensaje de Prueba',
      fr: 'Envoyer un Message de Test',
    },
  },
  messages: {
    success: {
      en: 'Webhook saved successfully!',
      es: '¡Webhook guardado exitosamente!',
      fr: 'Webhook enregistré avec succès!',
    },
    removed: {
      en: 'Webhook removed successfully',
      es: 'Webhook eliminado exitosamente',
      fr: 'Webhook supprimé avec succès',
    },
    testSent: {
      en: 'Test message sent to Discord!',
      es: '¡Mensaje de prueba enviado a Discord!',
      fr: 'Message de test envoyé à Discord!',
    },
  },
  errors: {
    invalidUrl: {
      en: 'Invalid Discord webhook URL',
      es: 'URL de webhook de Discord inválida',
      fr: 'URL de webhook Discord invalide',
    },
    saveFailed: {
      en: 'Failed to save webhook',
      es: 'Error al guardar el webhook',
      fr: 'Échec de l\'enregistrement du webhook',
    },
  },
};

// src/ui.tsx
import React, { useState } from 'react';
import { content } from './content';

export function SettingsPage({ serverId }: SettingsPageProps) {
  const { locale } = window.GameCP_SDK;
  const t = (translations: Record<string, string>) => 
    translations[locale] || translations.en;

  return (
    <div className="p-6">
      <h1>{t(content.page.title)}</h1>
      <p>{t(content.page.description)}</p>
      
      <form>
        <label>{t(content.form.webhookUrl)}</label>
        <input placeholder={t(content.form.placeholder)} />
        
        <button>{t(content.form.save)}</button>
        <button>{t(content.form.test)}</button>
      </form>
    </div>
  );
}
```

## Testing Translations

1. Change your user language in GameCP settings
2. Reload the extension page
3. Verify all text appears in the selected language
4. Test with missing translations to ensure fallback works

## Migration Guide

### Converting Existing Extensions

1. **Extract all hardcoded strings**
   ```typescript
   // Before
   <h1>Discord Notifications</h1>
   
   // After
   <h1>{t(content.title)}</h1>
   ```

2. **Create content dictionary**
   - Group related translations
   - Add all supported languages
   - Always include English fallback

3. **Update components**
   - Import content dictionary
   - Use translation helper
   - Test in multiple languages

## Future Enhancements

- Automatic translation suggestions
- Translation validation in CLI
- Shared translation keys across extensions
- Translation management UI
