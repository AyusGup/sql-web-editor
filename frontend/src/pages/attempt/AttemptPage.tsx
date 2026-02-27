import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../hooks/useRedux'
import { useAppSelector } from '../../hooks/useRedux'
import { fetchAssignment, clearCurrentAssignment } from '../../features/assignments/assignmentsSlice'
import { resetEditor } from '../../features/editor/editorSlice'
import { resetSave } from '../../features/save/saveSlice'
import { logoutThunk } from '../../features/auth/authSlice'
import { useAuth } from '../../hooks/useAuth'
import { ROUTES } from '../../constants/routes'
import QuestionPanel from '../../components/editor/QuestionPanel'
import SampleDataViewer from '../../components/editor/SampleDataViewer'
import MonacoEditorPanel from '../../components/editor/MonacoEditorPanel'
import ResultsPanel from '../../components/editor/ResultsPanel'
import HintPanel from '../../components/editor/HintPanel'
import './AttemptPage.scss'

type MobileTab = 'question' | 'editor' | 'results'

export default function AttemptPage() {
    const { id } = useParams<{ id: string }>()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { username } = useAuth()
    const { currentAssignment, progress, detailLoading, error } = useAppSelector((s) => s.assignments)
    const [mobileTab, setMobileTab] = useState<MobileTab>('question')

    useEffect(() => {
        if (!id) return
        dispatch(fetchAssignment(id))
        return () => {
            dispatch(clearCurrentAssignment())
            dispatch(resetEditor())
            dispatch(resetSave())
        }
    }, [id, dispatch])


    const handleLogout = async () => {
        await dispatch(logoutThunk())
        navigate(ROUTES.LOGIN)
    }

    if (detailLoading) {
        return (
            <div className="attempt-page is-loading">
                <div className="spinner" />
                <p>Loading assignment...</p>
            </div>
        )
    }

    if (error || !currentAssignment || !id) {
        return (
            <div className="attempt-page is-error">
                <p>{error || 'Assignment not found.'}</p>
                <button className="btn btn-primary" onClick={() => navigate(ROUTES.ASSIGNMENTS)}>
                    Back to assignments
                </button>
            </div>
        )
    }

    return (
        <div className="attempt-page">
            <header className="attempt-header">
                <button className="btn btn-ghost btn-sm attempt-back" onClick={() => navigate(ROUTES.ASSIGNMENTS)}>
                    Back
                </button>
                <span className="attempt-title">{currentAssignment.title}</span>
                <div className="attempt-user">
                    <span className="attempt-username">{username}</span>
                    <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>
                </div>
            </header>

            <nav className="attempt-nav">
                {(['question', 'editor', 'results'] as MobileTab[]).map((tab) => (
                    <button
                        key={tab}
                        className={`attempt-tab${mobileTab === tab ? ' is-active' : ''}`}
                        onClick={() => setMobileTab(tab)}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </nav>

            <div className="attempt-layout">
                <div className={`attempt-left${mobileTab !== 'question' ? ' is-hidden' : ''}`}>
                    <div className="attempt-panel">
                        <QuestionPanel assignment={currentAssignment} isCompleted={progress?.isCompleted} />
                    </div>
                    <div className="attempt-panel">
                        <SampleDataViewer tables={currentAssignment.sampleTables} />
                    </div>
                </div>

                <div className={`attempt-center${mobileTab !== 'editor' ? ' is-hidden' : ''}`}>
                    <div className="attempt-panel">
                        <MonacoEditorPanel assignmentId={id} initialQuery={progress?.sqlQuery ?? ''} />
                    </div>
                    <div className="attempt-hint">
                        <HintPanel assignmentId={id} />
                    </div>
                </div>

                <div className={`attempt-right${mobileTab !== 'results' ? ' is-hidden' : ''}`}>
                    <div className="attempt-panel">
                        <ResultsPanel expectedOutput={currentAssignment.expectedOutput} />
                    </div>
                </div>
            </div>
        </div>
    )
}
