import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['zip', 'github'], required: true },
    repoUrl: { type: String }, // For GitHub
    githubToken: { type: String }, // For private GitHub repos
    filePath: { type: String }, // For ZIP
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    metadata: { type: Object }, // Vector store ID etc.
    analysisReport: { type: String }, // Markdown report
    errorMessage: { type: String }, // Store ingestion errors
    structure: { type: Object } // Tree structure
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
