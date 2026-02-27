import { useNavigate } from 'react-router-dom'
import type { AssignmentListItem } from '../../types/assignment'
import { ROUTES } from '../../constants/routes'
import { theme } from '../../theme/tokens'
import './AssignmentCard.scss'

interface Props { assignment: AssignmentListItem }

export default function AssignmentCard({ assignment }: Props) {
    const navigate = useNavigate()
    const { _id, title, difficulty, tags } = assignment
    const color = theme.difficulty[difficulty]

    return (
        <article className="a-card" onClick={() => navigate(ROUTES.attemptPath(_id))}>
            <div className="a-card-header">
                <span className="badge" style={{ background: `${color}22`, color }}>
                    {difficulty}
                </span>
            </div>

            <h3 className="a-card-title">{title}</h3>

            <div className="a-card-tags">
                {tags.map((tag) => (
                    <span key={tag} className="badge badge-tag">{tag}</span>
                ))}
            </div>

            <div className="a-card-footer">
                <span className="a-card-cta">Attempt</span>
            </div>
        </article>
    )
}
