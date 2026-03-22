type Props = { status: 'green' | 'amber' | 'red' }

const colours = { green: 'bg-green-500', amber: 'bg-yellow-500', red: 'bg-red-500' }

export default function StatusDot({ status }: Props) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${colours[status]} animate-pulse`} />
  )
}
