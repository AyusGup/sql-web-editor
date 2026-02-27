import ReactMarkdown from 'react-markdown'
import type { Assignment } from '../../types/assignment'
import { theme } from '../../theme/tokens'
import './QuestionPanel.scss'

interface Props {
    assignment: Assignment
    isCompleted?: boolean
}

export default function QuestionPanel({ assignment, isCompleted }: Props) {
    const { title, difficulty, question, tags } = assignment
    const color = theme.difficulty[difficulty]

    return (
        <section className="question-panel">
            <div className="question-header">
                <h2 className="question-title">{title}</h2>
                <div className="question-meta">
                    <span className="badge" style={{ background: `${color}22`, color }}>
                        {difficulty}
                    </span>
                    {isCompleted && (
                        <span className="badge badge-success">✓ Completed</span>
                    )}
                    {tags.map((tag) => (
                        <span key={tag} className="badge badge-tag">{tag}</span>
                    ))}
                </div>
            </div>
            <div className="question-body">
                <ReactMarkdown>{question}</ReactMarkdown>
            </div>
        </section>
    )
}
