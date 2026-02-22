import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['zip', 'github'], required: true },
    language: { type: String, required: true },
    framework: { type: String, required: true },
    tools: { type: String },
    repoUrl: { type: String }, // For GitHub
    filePath: { type: String }, // For ZIP
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed'],
        default: 'pending'
    },
    metadata: { type: Object }, // Vector store ID etc.
    analysisReport: { type: String }, // Markdown report
    structure: { type: Object } // Tree structure
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);
