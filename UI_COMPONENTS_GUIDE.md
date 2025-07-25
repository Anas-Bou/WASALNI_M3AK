# VOYENGO - Guide des Composants UI

## 🎨 Design System & Composants

### Configuration Tailwind CSS

```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
}
```

## 📦 Composants de Base

### Button Component
```typescript
// src/components/ui/Button.tsx
import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utils/cn'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-600',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus-visible:ring-secondary-600',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-primary-600',
        ghost: 'hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, fullWidth, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          leftIcon && <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

### Input Component
```typescript
// src/components/ui/Input.tsx
import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import { ExclamationCircleIcon } from '@heroicons/react/24/solid'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            className={cn(
              'block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
              className
            )}
            ref={ref}
            {...props}
          />
          {(rightIcon || error) && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              {error ? (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              ) : (
                rightIcon
              )}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={cn('mt-1 text-sm', error ? 'text-red-600' : 'text-gray-500')}>
            {error || helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

### Card Component
```typescript
// src/components/ui/Card.tsx
import { cn } from '@/utils/cn'

interface CardProps {
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  onClick?: () => void
}

export function Card({ children, className, padding = 'md', hover, onClick }: CardProps) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200',
        paddingClasses[padding],
        hover && 'hover:shadow-md transition-shadow cursor-pointer',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-lg font-semibold text-gray-900', className)}>{children}</h3>
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-sm text-gray-500 mt-1', className)}>{children}</p>
}

export function CardContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('', className)}>{children}</div>
}

export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mt-4 pt-4 border-t border-gray-200', className)}>{children}</div>
}
```

### Modal Component (using Headless UI)
```typescript
// src/components/ui/Modal.tsx
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '@/utils/cn'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  closeButton?: boolean
}

export function Modal({ isOpen, onClose, title, description, children, size = 'md', closeButton = true }: ModalProps) {
  const sizeClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    full: 'sm:max-w-full',
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={cn('w-full transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all', sizeClasses[size])}>
                {(title || closeButton) && (
                  <div className="flex items-start justify-between mb-4">
                    {title && (
                      <div>
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                          {title}
                        </Dialog.Title>
                        {description && (
                          <Dialog.Description className="mt-1 text-sm text-gray-500">
                            {description}
                          </Dialog.Description>
                        )}
                      </div>
                    )}
                    {closeButton && (
                      <button
                        onClick={onClose}
                        className="ml-auto rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                )}
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
```

## 🎯 Composants Métier

### OfferCard Component
```typescript
// src/features/offers/components/OfferCard.tsx
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CalendarIcon, MapPinIcon, CurrencyEuroIcon, ScaleIcon } from '@heroicons/react/24/outline'
import { formatDate } from '@/utils/date'
import { TravelOffer } from '@/types'

interface OfferCardProps {
  offer: TravelOffer
  onSelect?: () => void
  showActions?: boolean
}

export function OfferCard({ offer, onSelect, showActions = true }: OfferCardProps) {
  return (
    <Card hover onClick={onSelect}>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Route */}
            <div className="flex items-center gap-2 text-gray-900 font-medium">
              <MapPinIcon className="h-5 w-5 text-gray-400" />
              <span>{offer.route.from.city}</span>
              <span className="text-gray-400">→</span>
              <span>{offer.route.to.city}</span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span>{formatDate(offer.travelDate)}</span>
              {offer.returnDate && (
                <>
                  <span className="text-gray-400">-</span>
                  <span>{formatDate(offer.returnDate)}</span>
                </>
              )}
            </div>

            {/* Space & Price */}
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-1 text-sm">
                <ScaleIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{offer.availableSpace.weight} kg disponibles</span>
              </div>
              <div className="flex items-center gap-1 text-sm">
                <CurrencyEuroIcon className="h-4 w-4 text-gray-400" />
                <span className="font-medium text-gray-900">
                  {offer.pricing.basePrice}€ + {offer.pricing.pricePerKg}€/kg
                </span>
              </div>
            </div>

            {/* Accepted Items */}
            <div className="flex flex-wrap gap-1 mt-3">
              {offer.acceptedItems.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* User Avatar */}
          <div className="ml-4">
            <img
              src={offer.user?.photoURL || '/default-avatar.png'}
              alt={offer.user?.displayName}
              className="h-12 w-12 rounded-full"
            />
            <div className="text-center mt-1">
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium">4.8</span>
                <span className="text-xs text-gray-500">(23)</span>
              </div>
            </div>
          </div>
        </div>

        {showActions && (
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" fullWidth>
              Voir le profil
            </Button>
            <Button size="sm" fullWidth>
              Contacter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### SearchFilters Component
```typescript
// src/features/search/components/SearchFilters.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { DatePicker } from '@/components/ui/DatePicker'
import { Select } from '@/components/ui/Select'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void
  loading?: boolean
}

export function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const { register, handleSubmit, control } = useForm<SearchFilters>()

  return (
    <form onSubmit={handleSubmit(onSearch)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Input
          {...register('from')}
          label="Ville de départ"
          placeholder="Paris, Lyon..."
          leftIcon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
        />
        <Input
          {...register('to')}
          label="Ville d'arrivée"
          placeholder="Marseille, Nice..."
          leftIcon={<MapPinIcon className="h-5 w-5 text-gray-400" />}
        />
        <DatePicker
          control={control}
          name="date"
          label="Date de voyage"
          placeholder="Sélectionner une date"
        />
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-down">
          <Select
            {...register('itemType')}
            label="Type d'objet"
            options={[
              { value: 'documents', label: 'Documents' },
              { value: 'electronics', label: 'Électronique' },
              { value: 'clothing', label: 'Vêtements' },
              { value: 'food', label: 'Nourriture' },
              { value: 'other', label: 'Autre' },
            ]}
          />
          <Input
            {...register('maxPrice')}
            type="number"
            label="Prix maximum (€)"
            placeholder="50"
          />
          <Input
            {...register('weight')}
            type="number"
            label="Poids (kg)"
            placeholder="5"
          />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          leftIcon={<AdjustmentsHorizontalIcon className="h-4 w-4" />}
        >
          {showAdvanced ? 'Masquer' : 'Plus'} de filtres
        </Button>
        <Button
          type="submit"
          loading={loading}
          leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
        >
          Rechercher
        </Button>
      </div>
    </form>
  )
}
```

### StepIndicator Component
```typescript
// src/components/ui/StepIndicator.tsx
import { CheckIcon } from '@heroicons/react/24/solid'
import { cn } from '@/utils/cn'

interface Step {
  id: string
  name: string
  description?: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
  orientation?: 'horizontal' | 'vertical'
}

export function StepIndicator({ steps, currentStep, orientation = 'horizontal' }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol className={cn(
        'flex',
        orientation === 'horizontal' ? 'space-x-8' : 'flex-col space-y-4'
      )}>
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <li key={step.id} className="flex items-center">
              <div className="relative flex items-center">
                <span
                  className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium',
                    isCompleted && 'bg-primary-600 text-white',
                    isCurrent && 'bg-primary-600 text-white ring-2 ring-offset-2 ring-primary-600',
                    !isCompleted && !isCurrent && 'bg-gray-200 text-gray-500'
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-5 w-5" />
                  ) : (
                    stepNumber
                  )}
                </span>
                {orientation === 'horizontal' && index < steps.length - 1 && (
                  <div
                    className={cn(
                      'absolute left-10 w-full h-0.5',
                      isCompleted ? 'bg-primary-600' : 'bg-gray-200'
                    )}
                    style={{ width: 'calc(100% + 2rem)' }}
                  />
                )}
              </div>
              <div className="ml-4">
                <p className={cn(
                  'text-sm font-medium',
                  isCurrent ? 'text-primary-600' : 'text-gray-900'
                )}>
                  {step.name}
                </p>
                {step.description && (
                  <p className="text-sm text-gray-500">{step.description}</p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
```

### EmptyState Component
```typescript
// src/components/ui/EmptyState.tsx
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      {Icon && (
        <Icon className="mx-auto h-12 w-12 text-gray-400" />
      )}
      <h3 className="mt-2 text-sm font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
      {action && (
        <div className="mt-6">
          <button
            type="button"
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  )
}
```

## 🔄 Loading States

### Skeleton Component
```typescript
// src/components/ui/Skeleton.tsx
import { cn } from '@/utils/cn'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  animation?: 'pulse' | 'wave' | 'none'
}

export function Skeleton({ className, variant = 'text', animation = 'pulse' }: SkeletonProps) {
  const baseClasses = 'bg-gray-200'
  
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  }
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  }

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
    />
  )
}

// Usage example for OfferCard skeleton
export function OfferCardSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### LoadingSpinner Component
```typescript
// src/components/ui/LoadingSpinner.tsx
import { cn } from '@/utils/cn'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className="flex items-center justify-center">
      <svg
        className={cn('animate-spin text-primary-600', sizeClasses[size], className)}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}
```

## 📱 Responsive Navigation

### Header Component
```typescript
// src/components/layout/Header.tsx
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, BellIcon } from '@heroicons/react/24/outline'
import { Link, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/hooks/redux'
import { cn } from '@/utils/cn'

const navigation = [
  { name: 'Rechercher', href: '/search' },
  { name: 'Mes voyages', href: '/my-offers' },
  { name: 'Mes envois', href: '/my-requests' },
  { name: 'Messages', href: '/messages' },
]

export function Header() {
  const location = useLocation()
  const user = useAppSelector((state) => state.auth.user)

  return (
    <Disclosure as="nav" className="bg-white shadow">
      {({ open }) => (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Link to="/" className="text-2xl font-bold text-primary-600">
                    VOYENGO
                  </Link>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium',
                        location.pathname === item.href
                          ? 'border-primary-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      )}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:items-center">
                <button className="p-1 rounded-full text-gray-400 hover:text-gray-500">
                  <BellIcon className="h-6 w-6" />
                </button>

                <Menu as="div" className="ml-3 relative">
                  <Menu.Button className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    <img
                      className="h-8 w-8 rounded-full"
                      src={user?.photoURL || '/default-avatar.png'}
                      alt=""
                    />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"