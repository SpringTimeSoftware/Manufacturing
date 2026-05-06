using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Commercial;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class CurrencyConfiguration : IEntityTypeConfiguration<Currency>
{
    public void Configure(EntityTypeBuilder<Currency> builder)
    {
        builder.ToTable("Currencies", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.CurrencyCode).HasMaxLength(8).IsRequired();
        builder.Property(entity => entity.CurrencyName).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.Symbol).HasMaxLength(8);
        builder.Property(entity => entity.RoundingMode).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.CurrencyCode }).IsUnique();
    }
}

public sealed class ExchangeRateSetupConfiguration : IEntityTypeConfiguration<ExchangeRateSetup>
{
    public void Configure(EntityTypeBuilder<ExchangeRateSetup> builder)
    {
        builder.ToTable("ExchangeRateSetups", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.RateType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.RateSource).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.ManualRate).HasColumnType("decimal(18,8)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.CurrencyId, entity.RateType, entity.EffectiveFrom }).IsUnique();
    }
}

public sealed class TaxCategoryConfiguration : IEntityTypeConfiguration<TaxCategory>
{
    public void Configure(EntityTypeBuilder<TaxCategory> builder)
    {
        builder.ToTable("TaxCategories", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.TaxCategoryCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TaxCategoryName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.TaxScope).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.DefaultRatePercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.TaxCategoryCode }).IsUnique();
    }
}

public sealed class TaxCodeConfiguration : IEntityTypeConfiguration<TaxCode>
{
    public void Configure(EntityTypeBuilder<TaxCode> builder)
    {
        builder.ToTable("TaxCodes", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.TaxCodeValue).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TaxCodeName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.RatePercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.TaxCategoryId, entity.TaxCodeValue }).IsUnique();
    }
}

public sealed class PaymentTermConfiguration : IEntityTypeConfiguration<PaymentTerm>
{
    public void Configure(EntityTypeBuilder<PaymentTerm> builder)
    {
        builder.ToTable("PaymentTerms", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PaymentTermsCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.PaymentTermsName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.DiscountPercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.DueCalculationMode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PaymentTermsCode }).IsUnique();
    }
}

public sealed class TradeTermConfiguration : IEntityTypeConfiguration<TradeTerm>
{
    public void Configure(EntityTypeBuilder<TradeTerm> builder)
    {
        builder.ToTable("TradeTerms", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.TradeTermsCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TradeTermsName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.TradeMode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ResponsibilitySummary).HasMaxLength(512);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.TradeTermsCode }).IsUnique();
    }
}

public sealed class PriceListConfiguration : IEntityTypeConfiguration<PriceList>
{
    public void Configure(EntityTypeBuilder<PriceList> builder)
    {
        builder.ToTable("PriceLists", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PriceListCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.PriceListName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.PriceListType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.CustomerSegment).HasMaxLength(64);
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PriceListCode }).IsUnique();
    }
}

public sealed class PriceListLineConfiguration : IEntityTypeConfiguration<PriceListLine>
{
    public void Configure(EntityTypeBuilder<PriceListLine> builder)
    {
        builder.ToTable("PriceListLines", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.MinQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.UnitPrice).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.PriceListId, entity.ItemId, entity.ItemGroupId, entity.UomId, entity.LineNo });
    }
}

public sealed class PriceAssignmentConfiguration : IEntityTypeConfiguration<PriceAssignment>
{
    public void Configure(EntityTypeBuilder<PriceAssignment> builder)
    {
        builder.ToTable("PriceAssignments", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.CustomerGroupCode).HasMaxLength(64);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.PriceListId, entity.PriorityRank, entity.CustomerId, entity.ItemGroupId });
    }
}

public sealed class DiscountSchemeConfiguration : IEntityTypeConfiguration<DiscountScheme>
{
    public void Configure(EntityTypeBuilder<DiscountScheme> builder)
    {
        builder.ToTable("DiscountSchemes", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SchemeCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.SchemeName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.DiscountType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.SchemeCode }).IsUnique();
    }
}

public sealed class DiscountRuleConfiguration : IEntityTypeConfiguration<DiscountRule>
{
    public void Configure(EntityTypeBuilder<DiscountRule> builder)
    {
        builder.ToTable("DiscountRules", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.RuleName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.ApplicabilityType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.CustomerGroupCode).HasMaxLength(64);
        builder.Property(entity => entity.MinQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.DiscountPercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.DiscountAmount).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.DiscountSchemeId, entity.RuleNo }).IsUnique();
    }
}
