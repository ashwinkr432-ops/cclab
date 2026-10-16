import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import {
  auth,
  getAuthErrorMessage,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
} from './assets/auth.jsx'
import { db } from './assets/firebase.js'
import './auth.css'

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5h6.6c3.9-3.6 6.1-8.8 6.1-14.9Z" />
      <path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.6-5c-1.8 1.2-4 2-6.9 2-5.3 0-9.8-3.6-11.4-8.5H5.8v5.2A20 20 0 0 0 24 44Z" />
      <path fill="#FBBC05" d="M12.6 27.7a12 12 0 0 1 0-7.4v-5.2H5.8a20 20 0 0 0 0 17.8l6.8-5.2Z" />
      <path fill="#EA4335" d="M24 11.8c3 0 5.7 1 7.8 3.1l5.8-5.8A19.4 19.4 0 0 0 24 4 20 20 0 0 0 5.8 15.1l6.8 5.2c1.6-4.9 6.1-8.5 11.4-8.5Z" />
    </svg>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [mode, setMode] = useState('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [taskText, setTaskText] = useState('')
  const [tasks, setTasks] = useState([])
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [taskLoading, setTaskLoading] = useState(false)

  useEffect(() => {
    let stopWatchingTasks = () => {}

    const stopWatchingAuth = onAuthStateChanged(
      auth,
      (currentUser) => {
        stopWatchingTasks()
        setUser(currentUser)
        setTasks([])
        setError('')

        if (currentUser) {
          const taskList = collection(db, 'users', currentUser.uid, 'tasks')

          stopWatchingTasks = onSnapshot(
            taskList,
            (snapshot) => {
              const savedTasks = snapshot.docs.map((taskDocument) => ({
                id: taskDocument.id,
                text: taskDocument.data().text,
              }))
              setTasks(savedTasks)
            },
            (taskError) => setError(getTaskErrorMessage(taskError)),
          )
        }
      },
      (authError) => setError(getAuthErrorMessage(authError)),
    )

    return () => {
      stopWatchingAuth()
      stopWatchingTasks()
    }
  }, [])

  async function handleAccountSubmit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        await signUpWithEmail(name.trim(), email.trim(), password)
      } else {
        await signInWithEmail(email.trim(), password)
      }
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)

    try {
      await signInWithGoogle()
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
    } finally {
      setLoading(false)
    }
  }

  async function handleSignOut() {
    setError('')
    setLoading(true)

    try {
      await signOutUser()
    } catch (authError) {
      setError(getAuthErrorMessage(authError))
    } finally {
      setLoading(false)
    }
  }

  function getTaskErrorMessage(taskError) {
    if (taskError?.code === 'permission-denied') {
      return 'Firebase denied access. Check that your Firestore rules are published.'
    }
    return taskError?.message || 'Could not load or save tasks.'
  }

  async function handleTaskSubmit(event) {
    event.preventDefault()

    const text = taskText.trim()
    if (!text) {
      setError('Please enter a task.')
      return
    }

    setTaskLoading(true)

    try {
      if (editingTaskId !== null) {
        const taskDocument = doc(db, 'users', user.uid, 'tasks', editingTaskId)
        await updateDoc(taskDocument, { text: text })
        setEditingTaskId(null)
      } else {
        const taskList = collection(db, 'users', user.uid, 'tasks')
        await addDoc(taskList, {
          text: text,
          createdAt: serverTimestamp(),
        })
      }

      setTaskText('')
      setError('')
    } catch (taskError) {
      setError(getTaskErrorMessage(taskError))
    } finally {
      setTaskLoading(false)
    }
  }

  function editTask(task) {
    setTaskText(task.text)
    setEditingTaskId(task.id)
    setError('')
  }

  function cancelEdit() {
    setTaskText('')
    setEditingTaskId(null)
    setError('')
  }

  async function deleteTask(taskId) {
    setTaskLoading(true)

    try {
      const taskDocument = doc(db, 'users', user.uid, 'tasks', taskId)
      await deleteDoc(taskDocument)

      if (editingTaskId === taskId) {
        setEditingTaskId(null)
        setTaskText('')
      }
      setError('')
    } catch (taskError) {
      setError(getTaskErrorMessage(taskError))
    } finally {
      setTaskLoading(false)
    }
  }

  return (
    <main className="page">
      {user ? (
        <section className="card task-card">
          <div className="card-heading">
            <div>
              <h1>My tasks</h1>
              <p className="description">Signed in as {user.email}</p>
            </div>
            <button className="small-button" type="button" onClick={handleSignOut} disabled={loading}>
              Sign out
            </button>
          </div>

          <form className="task-form" onSubmit={handleTaskSubmit}>
            <label htmlFor="task">Task</label>
            <div className="task-input-row">
              <input
                id="task"
                type="text"
                placeholder="What do you need to do?"
                value={taskText}
                onChange={(event) => setTaskText(event.target.value)}
                disabled={taskLoading}
              />
              <button className="button" type="submit" disabled={taskLoading}>
                {taskLoading ? 'Saving…' : editingTaskId !== null ? 'Save' : 'Add'}
              </button>
              {editingTaskId !== null && (
                <button className="small-button" type="button" onClick={cancelEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>

          {error && <p className="error" role="alert">{error}</p>}

          {tasks.length === 0 && !taskLoading ? (
            <p className="empty-message">No tasks yet. Add your first task above.</p>
          ) : tasks.length > 0 && (
            <ul className="task-list">
              {tasks.map((task) => (
                <li className="task-item" key={task.id}>
                  <span>{task.text}</span>
                  <div className="task-actions">
                    <button className="small-button" type="button" onClick={() => editTask(task)} disabled={taskLoading}>
                      Edit
                    </button>
                    <button className="small-button delete-button" type="button" onClick={() => deleteTask(task.id)} disabled={taskLoading}>
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="card signin-card">
          <h1>{mode === 'signup' ? 'Create account' : 'Log in'}</h1>
          <p className="description">
            {mode === 'signup' ? 'Sign up to get started' : 'Welcome back'}
          </p>

          <div className="mode-switch">
            <button
              className={mode === 'signup' ? 'selected' : ''}
              type="button"
              onClick={() => { setMode('signup'); setError('') }}
            >
              Sign up
            </button>
            <button
              className={mode === 'login' ? 'selected' : ''}
              type="button"
              onClick={() => { setMode('login'); setError('') }}
            >
              Log in
            </button>
          </div>

          <form className="account-form" onSubmit={handleAccountSubmit}>
            {mode === 'signup' && (
              <label>
                Name
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  disabled={loading}
                />
              </label>
            )}
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={loading}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
                disabled={loading}
              />
            </label>
            <button className="button" type="submit" disabled={loading}>
              {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Log in'}
            </button>
          </form>

          <div className="divider">or</div>
          <button className="google-button" type="button" onClick={handleGoogleSignIn} disabled={loading}>
            <GoogleIcon />
            Sign in with Google
          </button>

          {error && <p className="error" role="alert">{error}</p>}
        </section>
      )}
    </main>
  )
}

export default App
