namespace STS.Mfg.Domain.Abstractions;

public abstract class Entity
{
    public long Id { get; protected set; }
}

public abstract class AggregateRoot : Entity;

public abstract class AuditableEntity : AggregateRoot
{
    public DateTimeOffset CreatedOn { get; protected set; }
    public long? CreatedByUserId { get; protected set; }
    public DateTimeOffset ModifiedOn { get; protected set; }
    public long? ModifiedByUserId { get; protected set; }
}

public abstract class ValueObject : IEquatable<ValueObject>
{
    protected abstract IEnumerable<object?> GetEqualityComponents();

    public bool Equals(ValueObject? other)
    {
        if (other is null || other.GetType() != GetType())
        {
            return false;
        }

        return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
    }

    public override bool Equals(object? obj) => obj is ValueObject other && Equals(other);

    public override int GetHashCode()
    {
        return GetEqualityComponents()
            .Aggregate(0, (current, component) => HashCode.Combine(current, component));
    }
}
