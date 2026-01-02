/**
 * Game Scheduler Extension - Translation Content
 * Supports: en, es, ro, pt-BR, da, zh-CN, zh-TW (matching main app)
 */

export const schedulerContent = {
    nav: {
        title: {
            en: 'Scheduler',
            es: 'Programador',
            ro: 'Planificator',
            'pt-BR': 'Agendador',
            da: 'Planlægger',
            'zh-CN': '计划任务',
            'zh-TW': '排程器'
        }
    },
    page: {
        title: {
            en: 'Task Scheduler',
            es: 'Programador de Tareas',
            ro: 'Planificator de Sarcini',
            'pt-BR': 'Agendador de Tarefas',
            da: 'Opgaveplanlægger',
            'zh-CN': '任务计划程序',
            'zh-TW': '工作排程器'
        },
        description: {
            en: 'Schedule automated starts, stops, and restarts for your game server',
            es: 'Programa inicios, paradas y reinicios automáticos para tu servidor de juegos',
            ro: 'Programați porniri, opriri și reporniri automate pentru serverul dvs. de jocuri',
            'pt-BR': 'Agende inícios, paradas e reinicializações automáticas para seu servidor de jogos',
            da: 'Planlæg automatiske starter, stop og genstarter til din spilserver',
            'zh-CN': '为您的游戏服务器安排自动启动、停止和重启',
            'zh-TW': '為您的遊戲伺服器排程自動啟動、停止和重啟'
        }
    },
    createTask: {
        title: {
            en: 'Create Scheduled Task',
            es: 'Crear Tarea Programada',
            ro: 'Creați Sarcină Planificată',
            'pt-BR': 'Criar Tarefa Agendada',
            da: 'Opret planlagt opgave',
            'zh-CN': '创建计划任务',
            'zh-TW': '建立排程工作'
        },
        description: {
            en: 'Set up automated server start, stop, or restart schedules',
            es: 'Configura horarios automáticos de inicio, parada o reinicio del servidor',
            ro: 'Configurați programări automate de pornire, oprire sau repornire a serverului',
            'pt-BR': 'Configure agendamentos automáticos de início, parada ou reinicialização do servidor',
            da: 'Konfigurer automatiske server start, stop eller genstart tidsplaner',
            'zh-CN': '设置服务器自动启动、停止或重启计划',
            'zh-TW': '設定伺服器自動啟動、停止或重啟排程'
        }
    },
    form: {
        taskName: {
            en: 'Task Name',
            es: 'Nombre de la Tarea',
            ro: 'Numele Sarcinii',
            'pt-BR': 'Nome da Tarefa',
            da: 'Opgavenavn',
            'zh-CN': '任务名称',
            'zh-TW': '工作名稱'
        },
        taskNamePlaceholder: {
            en: 'Daily Restart',
            es: 'Reinicio Diario',
            ro: 'Repornire Zilnică',
            'pt-BR': 'Reinicialização Diária',
            da: 'Daglig genstart',
            'zh-CN': '每日重启',
            'zh-TW': '每日重啟'
        },
        actionType: {
            en: 'Action Type',
            es: 'Tipo de Acción',
            ro: 'Tipul Acțiunii',
            'pt-BR': 'Tipo de Ação',
            da: 'Handlingstype',
            'zh-CN': '操作类型',
            'zh-TW': '動作類型'
        },
        actionStart: {
            en: 'Start Server',
            es: 'Iniciar Servidor',
            ro: 'Porniți Serverul',
            'pt-BR': 'Iniciar Servidor',
            da: 'Start server',
            'zh-CN': '启动服务器',
            'zh-TW': '啟動伺服器'
        },
        actionStop: {
            en: 'Stop Server',
            es: 'Detener Servidor',
            ro: 'Opriți Serverul',
            'pt-BR': 'Parar Servidor',
            da: 'Stop server',
            'zh-CN': '停止服务器',
            'zh-TW': '停止伺服器'
        },
        actionRestart: {
            en: 'Restart Server',
            es: 'Reiniciar Servidor',
            ro: 'Reporniți Serverul',
            'pt-BR': 'Reiniciar Servidor',
            da: 'Genstart server',
            'zh-CN': '重启服务器',
            'zh-TW': '重啟伺服器'
        },
        actionCommand: {
            en: 'Run Command',
            es: 'Ejecutar Comando',
            ro: 'Executați Comandă',
            'pt-BR': 'Executar Comando',
            da: 'Kør kommando',
            'zh-CN': '运行命令',
            'zh-TW': '執行命令'
        },
        actionWipe: {
            en: 'Wipe & Restart',
            es: 'Limpiar y Reiniciar',
            ro: 'Ștergeți și Reporniți',
            'pt-BR': 'Limpar e Reiniciar',
            da: 'Wipe og genstart',
            'zh-CN': '清档并重启',
            'zh-TW': '清除並重啟'
        },
        schedule: {
            en: 'Schedule (Cron Expression)',
            es: 'Programación (Expresión Cron)',
            ro: 'Programare (Expresie Cron)',
            'pt-BR': 'Agendamento (Expressão Cron)',
            da: 'Tidsplan (Cron-udtryk)',
            'zh-CN': '计划（Cron 表达式）',
            'zh-TW': '排程（Cron 表達式）'
        },
        scheduleHint: {
            en: 'Examples: "0 4 * * *" (4 AM daily), "0 */6 * * *" (every 6 hours)',
            es: 'Ejemplos: "0 4 * * *" (4 AM diario), "0 */6 * * *" (cada 6 horas)',
            ro: 'Exemple: "0 4 * * *" (4 dimineața zilnic), "0 */6 * * *" (la fiecare 6 ore)',
            'pt-BR': 'Exemplos: "0 4 * * *" (4h diariamente), "0 */6 * * *" (a cada 6 horas)',
            da: 'Eksempler: "0 4 * * *" (kl. 4 dagligt), "0 */6 * * *" (hver 6. time)',
            'zh-CN': '示例："0 4 * * *"（每天凌晨4点）、"0 */6 * * *"（每6小时）',
            'zh-TW': '範例："0 4 * * *"（每日凌晨4點）、"0 */6 * * *"（每6小時）'
        },
        schedulePlaceholder: {
            en: '0 4 * * *',
            es: '0 4 * * *',
            ro: '0 4 * * *',
            'pt-BR': '0 4 * * *',
            da: '0 4 * * *',
            'zh-CN': '0 4 * * *',
            'zh-TW': '0 4 * * *'
        }
    },
    buttons: {
        create: {
            en: 'Create Task',
            es: 'Crear Tarea',
            ro: 'Creați Sarcină',
            'pt-BR': 'Criar Tarefa',
            da: 'Opret opgave',
            'zh-CN': '创建任务',
            'zh-TW': '建立工作'
        },
        delete: {
            en: 'Delete',
            es: 'Eliminar',
            ro: 'Ștergeți',
            'pt-BR': 'Excluir',
            da: 'Slet',
            'zh-CN': '删除',
            'zh-TW': '刪除'
        }
    },
    tasks: {
        title: {
            en: 'Scheduled Tasks',
            es: 'Tareas Programadas',
            ro: 'Sarcini Planificate',
            'pt-BR': 'Tarefas Agendadas',
            da: 'Planlagte opgaver',
            'zh-CN': '计划任务',
            'zh-TW': '排程工作'
        },
        active: {
            en: 'Active',
            es: 'Activo',
            ro: 'Activ',
            'pt-BR': 'Ativo',
            da: 'Aktiv',
            'zh-CN': '活跃',
            'zh-TW': '活躍'
        },
        action: {
            en: 'Action',
            es: 'Acción',
            ro: 'Acțiune',
            'pt-BR': 'Ação',
            da: 'Handling',
            'zh-CN': '操作',
            'zh-TW': '動作'
        },
        schedule: {
            en: 'Schedule',
            es: 'Programación',
            ro: 'Programare',
            'pt-BR': 'Agendamento',
            da: 'Tidsplan',
            'zh-CN': '计划',
            'zh-TW': '排程'
        },
        nextRun: {
            en: 'Next run',
            es: 'Próxima ejecución',
            ro: 'Următoarea execuție',
            'pt-BR': 'Próxima execução',
            da: 'Næste kørsel',
            'zh-CN': '下次运行',
            'zh-TW': '下次執行'
        }
    },
    messages: {
        created: {
            en: 'Task created successfully!',
            es: '¡Tarea creada exitosamente!',
            ro: 'Sarcina a fost creată cu succes!',
            'pt-BR': 'Tarefa criada com sucesso!',
            da: 'Opgave oprettet!',
            'zh-CN': '任务创建成功！',
            'zh-TW': '工作建立成功！'
        },
        deleted: {
            en: 'Task deleted successfully',
            es: 'Tarea eliminada exitosamente',
            ro: 'Sarcina a fost ștearsă cu succes',
            'pt-BR': 'Tarefa excluída com sucesso',
            da: 'Opgave slettet',
            'zh-CN': '任务删除成功',
            'zh-TW': '工作刪除成功'
        },
        createFailed: {
            en: 'Failed to create task',
            es: 'Error al crear la tarea',
            ro: 'Nu s-a putut crea sarcina',
            'pt-BR': 'Falha ao criar tarefa',
            da: 'Kunne ikke oprette opgave',
            'zh-CN': '创建任务失败',
            'zh-TW': '建立工作失敗'
        },
        deleteFailed: {
            en: 'Failed to delete task',
            es: 'Error al eliminar la tarea',
            ro: 'Nu s-a putut șterge sarcina',
            'pt-BR': 'Falha ao excluir tarefa',
            da: 'Kunne ikke slette opgave',
            'zh-CN': '删除任务失败',
            'zh-TW': '刪除工作失敗'
        }
    },
    confirm: {
        deleteTitle: {
            en: 'Delete Task',
            es: 'Eliminar Tarea',
            ro: 'Ștergeți Sarcina',
            'pt-BR': 'Excluir Tarefa',
            da: 'Slet opgave',
            'zh-CN': '删除任务',
            'zh-TW': '刪除工作'
        },
        deleteMessage: {
            en: 'Are you sure you want to delete this scheduled task?',
            es: '¿Estás seguro de que quieres eliminar esta tarea programada?',
            ro: 'Sigur doriți să ștergeți această sarcină planificată?',
            'pt-BR': 'Tem certeza de que deseja excluir esta tarefa agendada?',
            da: 'Er du sikker på, at du vil slette denne planlagte opgave?',
            'zh-CN': '您确定要删除此计划任务吗？',
            'zh-TW': '您確定要刪除此排程工作嗎？'
        }
    }
};
