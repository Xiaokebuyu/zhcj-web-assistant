from app.tool.base import BaseTool


_TERMINATE_DESCRIPTION = """Terminate the interaction when the request is met OR if the assistant cannot proceed further with the task.
When you have finished all the tasks, call this tool to end the work."""


class Terminate(BaseTool):
    name: str = "terminate"
    description: str = _TERMINATE_DESCRIPTION
    parameters: dict = {
        "type": "object",
        "properties": {
            "status": {
                "type": "string",
                "description": "The finish status of the interaction.",
                "enum": ["success", "failure"],
            },
            "message": {
                "type": "string",
                "description": "Optional detail message for termination.",
            },
        },
        "required": ["status"],
    }

    async def execute(self, status: str, message: str | None = None, **kwargs) -> str:  # type: ignore[override]
        """Finish the current execution. Extra args are ignored for compatibility."""
        if message:
            return f"The interaction has been completed with status: {status}. Message: {message}"
        return f"The interaction has been completed with status: {status}"
