# AI Orchestrator para Sistema Chifles

Este es el servicio encargado de la orquestación de inteligencia artificial, implementando el patrón Strategy para proveedores de LLM (Gemini/OpenAI) y actuando como servidor MCP para ejecutar herramientas sobre el sistema principal.

## Configuración Inicial

1.  **Instalar dependencias**:
    ```bash
    npm install
    ```

2.  **Variables de Entorno (.env)**:
    ```env
    PORT=3001
    GEMINI_API_KEY=tu_clave_aqui
    OPENAI_API_KEY=tu_clave_aqui
    API_REST_URL=http://localhost:3000
    WEBSOCKET_URL=http://localhost:8080
    ```

## Estructura del Proyecto

*   `src/llm/`: Adaptadores y Estrategias para Modelos de Lenguaje.
*   `src/mcp/`: Implementación de herramientas (Tools) de consulta y acción.
*   `src/orchestrator/`: Lógica de coordinación entre LLM, Tools y Usuario.

## Scripts

*   `npm run start:dev`: Iniciar servidor en modo desarrollo.
