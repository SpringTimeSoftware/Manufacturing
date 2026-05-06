interface SkeletonProps {
  rows?: number;
}

export function PageSkeleton({ rows = 3 }: SkeletonProps) {
  return (
    <div aria-hidden="true" className="ui-skeleton" role="presentation">
      <div className="ui-skeleton__line ui-skeleton__line--title" />
      {Array.from({ length: rows }).map((_, index) => (
        <div className="ui-skeleton__line" key={index} />
      ))}
    </div>
  );
}
