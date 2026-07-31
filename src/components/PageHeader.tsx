interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge }: PageHeaderProps) {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center gap-3 mb-4">
        <h1 className="font-orbitron text-5xl md:text-6xl font-bold aurora-text">
          {title}
        </h1>
        {badge}
      </div>
      {subtitle && (
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className="h-1 w-32 mx-auto mt-6 bg-gradient-to-r from-purple-500 via-sky-400 to-blue-500 rounded-full" />
    </div>
  );
}
