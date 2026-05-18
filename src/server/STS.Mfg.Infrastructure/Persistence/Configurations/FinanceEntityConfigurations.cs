using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Finance;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class ChartOfAccountConfiguration : IEntityTypeConfiguration<ChartOfAccount>
{
    public void Configure(EntityTypeBuilder<ChartOfAccount> builder)
    {
        builder.ToTable("ChartOfAccounts", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.AccountCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.AccountName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.AccountClass).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.NormalBalance).HasMaxLength(8).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.AccountCode }).IsUnique();
    }
}

public sealed class FiscalPeriodConfiguration : IEntityTypeConfiguration<FiscalPeriod>
{
    public void Configure(EntityTypeBuilder<FiscalPeriod> builder)
    {
        builder.ToTable("FiscalPeriods", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PeriodName).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.FiscalYear, entity.PeriodNo }).IsUnique();
    }
}

public sealed class FinancePostingProfileConfiguration : IEntityTypeConfiguration<FinancePostingProfile>
{
    public void Configure(EntityTypeBuilder<FinancePostingProfile> builder)
    {
        builder.ToTable("PostingProfiles", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ProfileCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.PostingKey).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.MappingSource).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PostingKey, entity.ProfileCode }).IsUnique();
    }
}

public sealed class GeneralLedgerJournalConfiguration : IEntityTypeConfiguration<GeneralLedgerJournal>
{
    public void Configure(EntityTypeBuilder<GeneralLedgerJournal> builder)
    {
        builder.ToTable("GeneralLedgerJournals", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.JournalNo).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.SourceModule).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.SourceDocumentNo).HasMaxLength(80);
        builder.Property(entity => entity.CurrencyCode).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.ExchangeRateSnapshot).HasColumnType("decimal(18,8)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.JournalNo }).IsUnique();
    }
}

public sealed class GeneralLedgerJournalLineConfiguration : IEntityTypeConfiguration<GeneralLedgerJournalLine>
{
    public void Configure(EntityTypeBuilder<GeneralLedgerJournalLine> builder)
    {
        builder.ToTable("GeneralLedgerJournalLines", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.DebitAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.CreditAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.Narration).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.JournalId, entity.LineNo }).IsUnique();
    }
}

public sealed class AccountsReceivableInvoiceConfiguration : IEntityTypeConfiguration<AccountsReceivableInvoice>
{
    public void Configure(EntityTypeBuilder<AccountsReceivableInvoice> builder)
    {
        builder.ToTable("AccountsReceivableInvoices", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.InvoiceNo).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.SourceDocumentNo).HasMaxLength(80);
        builder.Property(entity => entity.CurrencyCode).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.ExchangeRateSnapshot).HasColumnType("decimal(18,8)");
        builder.Property(entity => entity.SubtotalAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.DiscountTotalAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxableAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxTotalAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.FreightAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.PackingAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.InsuranceAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.OtherChargesAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.AddLessAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.RoundOffAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.GrandTotalAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ArStatus).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.InvoiceNo }).IsUnique();
    }
}

public sealed class AccountsReceivableInvoiceLineConfiguration : IEntityTypeConfiguration<AccountsReceivableInvoiceLine>
{
    public void Configure(EntityTypeBuilder<AccountsReceivableInvoiceLine> builder)
    {
        builder.ToTable("AccountsReceivableInvoiceLines", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.InvoiceQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.UnitPrice).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.DiscountAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxRateSnapshot).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.TaxAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.LineSubtotal).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.LineTaxableAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.LineTotalAmount).HasColumnType("decimal(18,4)");
        builder.HasIndex(entity => new { entity.ArInvoiceId, entity.LineNo }).IsUnique();
    }
}

public sealed class AccountsReceivableLedgerEntryConfiguration : IEntityTypeConfiguration<AccountsReceivableLedgerEntry>
{
    public void Configure(EntityTypeBuilder<AccountsReceivableLedgerEntry> builder)
    {
        builder.ToTable("AccountsReceivableLedgerEntries", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.EntryNo).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ReceivableAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.ReceivedAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.BalanceAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.EntryNo }).IsUnique();
    }
}

public sealed class TaxLedgerEntryConfiguration : IEntityTypeConfiguration<TaxLedgerEntry>
{
    public void Configure(EntityTypeBuilder<TaxLedgerEntry> builder)
    {
        builder.ToTable("TaxLedgerEntries", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.TaxDirection).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.TaxRateSnapshot).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.TaxableAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.SourceDocumentType, entity.SourceDocumentId });
    }
}

public sealed class InventoryValuationEntryConfiguration : IEntityTypeConfiguration<InventoryValuationEntry>
{
    public void Configure(EntityTypeBuilder<InventoryValuationEntry> builder)
    {
        builder.ToTable("InventoryValuationEntries", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.SourceDocumentNo).HasMaxLength(80);
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.UnitCost).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TotalCost).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.ValuationMethod).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => entity.StockTransactionId);
        builder.HasIndex(entity => new { entity.SourceDocumentType, entity.SourceDocumentId });
    }
}
