# Agent Operational Rules

1.  **NO Git Actions**: Do not execute `git add`, `git commit`, `git push`, or any other git modifying commands. The user handles version control.
2.  **NO Script Execution**: Do not run scripts (e.g., `npm run`, `node`, `yarn`).
3.  **Command Proposal**: Instead of running execution commands, provide the exact command string in the chat for the user to copy-paste.
    *   Specify the Working Directory (CWD).
    *   Wait for user confirmation before proceeding with dependent steps.
4.  **Allowed Actions**:
    *   Editing code (`replace_file_content`, `write_to_file`, etc.).
    *   Reading files and directories (`list_dir`, `view_file`, etc.).
    *   Passive info gathering is permitted, but avoid shell commands where possible.
