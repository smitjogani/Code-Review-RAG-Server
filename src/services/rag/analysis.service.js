import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import logger from '../../utils/logger.js';
import config from '../../config/index.js';

class AnalysisService {
    constructor() {
        this.model = new ChatGoogleGenerativeAI({
            model: config.geminiModel,
            maxOutputTokens: 8192,
            apiKey: config.googleApiKey,
            temperature: 0.2, // Low temp for more deterministic code analysis
        });
    }

    /**
     * Generates a comprehensive analysis report of the codebase.
     * @param {Array} fileList List of file paths
     * @param {Array} coreFiles Content of key files (package.json, active files, etc.)
     * @param {Object} projectContext { language, framework }
     */
    async generateReport(fileList, coreFiles, projectContext) {
        try {
            logger.info("Generating analysis report with Gemini...");

            const fileStructure = fileList.slice(0, 50).join("\n"); // Limit to prevent token overflow
            const coreContent = coreFiles.map(f => `File: ${f.path}\nContent:\n${f.content.substring(0, 1500)}`).join("\n\n");

            const prompt = PromptTemplate.fromTemplate(`
You are an Elite Principal Software Architect performing a high-level codebase audit. 
Project Context: {language} {framework}

Based on the provided file structure and core files, generate a professional, polished, and executive-level "Codebase Audit & Strategy Report" in Markdown.

Use extremely professional language and high-quality Markdown formatting.

CRITICAL Formatting Rule: 
You MUST use colored emojis as bullet points to represent the severity or quality of your observations:
- 🟢 (Green) for Strong, excellent code / clean patterns.
- 🟡 (Yellow) for Minor warnings, areas for optimization.
- 🟠 (Orange) for Medium risk, technical debt, or confusing logic.
- 🔴 (Red) for Critical issues, security risks, or high cyclomatic complexity.

### Required Structure:

1.  **Executive Summary**
    *   Brief overview of the project's purpose and overall architectural maturity.
    *   **Overall File Quality Grade:** Give an explicit quality grade (e.g., A, B, C, F) with a 1-sentence justification.

2.  **Architecture & Design Pattern**
    *   What is the core pattern (e.g., Layered, Microservices, Hexagonal)?
    *   How is the code organized across directories?

3.  **Folder Structure & Architecture**
    *   Display the **Current Folder Structure** (as a clear tree).
    *   Display a **Suggested New Folder Structure** with all files and folders organized following industry best practices.
    *   List the **Pros & Cons** of the suggested structure versus the current one.

4.  **Code Quality Assessment**
    *   🟢 **Strong Points:** Clean patterns and robust logic found.
    *   🟠 **Weak Points:** Areas of technical debt, high cyclomatic complexity.
    *   🔴 **Critical Risks:** Missing error handling, security gaps, etc.

5.  **Detailed Code Review & File Quality**
    *   Use the colored emoji bullets (🟢, 🟡, 🟠, 🔴) to do a deep dive into specific file-level observations.
    *   Evaluate specific file qualities (e.g., "🔴 auth.service.js lacks input sanitization", "🟢 db.js has good connection pooling").

6.  **Strategic Recommendations**
    *   Provide 3-5 high-impact, prioritized steps to move the project toward production-ready status.

---
**Codebase Data provided for context:**

File Structure (excerpt):
{structure}

Key Files Content:
{files}

Keep the tone objective, expert, and authoritative yet constructive. Focus on providing value-driven, developer-ready insights.

ALWAYS end your entire report with EXACTLY the following marker: "--- SUGGESTED_QUESTIONS ---", followed by exactly 3 suggested follow-up questions the user can ask about this codebase, each on a new line starting with "- ".
            `);

            const chain = prompt.pipe(this.model).pipe(new StringOutputParser());

            const report = await chain.invoke({
                language: projectContext.language,
                framework: projectContext.framework,
                structure: fileStructure,
                files: coreContent
            });

            return report;
        } catch (error) {
            logger.error("Failed to generate analysis report:", error);
            return "## Analysis Generation Failed\n\nCould not generate the report due to an error. You can still chat with the codebase.";
        }
    }
}

export const analysisService = new AnalysisService();
