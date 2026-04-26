import { WorkoutNav } from '@/components/workout-nav'

export default function WorkoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <WorkoutNav />
      {children}
    </div>
  )
}
