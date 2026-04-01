import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import OptionCard from './OptionCard'
import titleBg from '../../assets/title-bg.jpg'
import logo from '../../assets/sift.png'

const STEPS = [
  {
    key: 'gradeLevel',
    title: 'What grade are you in?',
    subtitle: 'Select your current grade level',
    grid: 'option-grid-2',
    multi: false,
    options: [
      { label: 'Freshman', sub: '9th' },
      { label: 'Sophomore', sub: '10th' },
      { label: 'Junior', sub: '11th' },
      { label: 'Senior', sub: '12th' },
    ],
  },
  {
    key: 'careerPath',
    title: 'What career path interests you?',
    subtitle: 'Select the field you are most interested in',
    grid: 'option-grid-2',
    multi: false,
    options: [
      { label: 'STEM' },
      { label: 'Medicine/Healthcare' },
      { label: 'Business/Finance' },
      { label: 'Law/Government' },
      { label: 'Arts/Humanities' },
      { label: 'Education' },
      { label: 'Undecided', wide: true },
    ],
  },
  {
    key: 'collegeGoals',
    title: 'What are your college goals?',
    subtitle: 'Select the type of college you are aiming for',
    grid: 'option-grid-1',
    multi: false,
    options: [
      { label: 'Ivy League/Top 10' },
      { label: 'Top 25-50' },
      { label: 'State School' },
      { label: 'Community College' },
      { label: 'Undecided' },
    ],
  },
  {
    key: 'academicInterests',
    title: 'What subjects interest you?',
    subtitle: 'Select all that apply',
    grid: 'option-grid-3',
    multi: true,
    options: [
      { label: 'Math' },
      { label: 'Science' },
      { label: 'English/Literature' },
      { label: 'History' },
      { label: 'Computer Science' },
      { label: 'Foreign Languages' },
      { label: 'Arts' },
      { label: 'Social Studies' },
    ],
  },
  {
    key: 'gpaGoal',
    title: 'What is your GPA goal?',
    subtitle: 'Select your target GPA range',
    grid: 'option-grid-1',
    multi: false,
    options: [
      { label: '4.0+' },
      { label: '3.5-3.9' },
      { label: '3.0-3.4' },
      { label: '2.5-2.9' },
      { label: 'Just passing' },
    ],
  },
]

export default function OnboardingPage() {
  const { completeOnboarding } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [answers, setAnswers] = useState({
    gradeLevel: '',
    careerPath: '',
    collegeGoals: '',
    academicInterests: [],
    gpaGoal: '',
  })

  const totalSteps = STEPS.length
  const progressPercent = (currentStep / totalSteps) * 100

  const handleSelect = (stepKey, value, multi) => {
    if (multi) {
      setAnswers((prev) => {
        const current = prev[stepKey] || []
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value]
        return { ...prev, [stepKey]: updated }
      })
    } else {
      setAnswers((prev) => ({ ...prev, [stepKey]: value }))
    }
  }

  const isStepComplete = () => {
    const step = STEPS[currentStep - 1]
    const value = answers[step.key]
    if (step.multi) return Array.isArray(value) && value.length > 0
    return value !== ''
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((s) => s + 1)
    } else {
      completeOnboarding(answers)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1)
  }

  return (
    <div className="page-container onboarding-page">
      <div className="login-bg">
        <img src={titleBg} alt="" className="bg-image" />
        <div className="bg-overlay" />
      </div>
      <div className="onboarding-wrapper">
        <div className="onboarding-header">
          <img src={logo} alt="LT" className="logo" />
          <h1 className="app-title">LT Assistant</h1>
          <p className="subtitle">Let&apos;s personalize your experience</p>
        </div>
        <div className="onboarding-card">
          <div className="onboarding-progress">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="progress-label">
              Step {currentStep} of {totalSteps}
            </span>
          </div>

          {STEPS.map((step, idx) => (
            <div
              key={step.key}
              className={`onboarding-step ${currentStep === idx + 1 ? 'active' : ''}`}
            >
              <h2 className="step-title">{step.title}</h2>
              <p className="step-subtitle">{step.subtitle}</p>
              <div className={`option-grid ${step.grid}`}>
                {step.options.map((opt) => {
                  const isSelected = step.multi
                    ? (answers[step.key] || []).includes(opt.label)
                    : answers[step.key] === opt.label
                  return (
                    <OptionCard
                      key={opt.label}
                      label={opt.label}
                      sub={opt.sub}
                      selected={isSelected}
                      onClick={() => handleSelect(step.key, opt.label, step.multi)}
                      wide={opt.wide}
                    />
                  )
                })}
              </div>
            </div>
          ))}

          <div className="onboarding-nav">
            <button
              className="btn btn-outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </button>
            <button
              className="btn btn-primary"
              onClick={handleNext}
              disabled={!isStepComplete()}
            >
              {currentStep === totalSteps ? 'Complete' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
