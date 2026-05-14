using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Procurement;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class PurchaseRequisitionConfiguration : IEntityTypeConfiguration<PurchaseRequisition>
{
    public void Configure(EntityTypeBuilder<PurchaseRequisition> builder)
    {
        builder.ToTable("PurchaseRequisitions", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PurchaseRequisitionNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PurchaseRequisitionNo }).IsUnique();
    }
}

public sealed class PurchaseRequisitionLineConfiguration : IEntityTypeConfiguration<PurchaseRequisitionLine>
{
    public void Configure(EntityTypeBuilder<PurchaseRequisitionLine> builder)
    {
        builder.ToTable("PurchaseRequisitionLines", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.RequiredQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.PurchaseRequisitionId, entity.LineNo }).IsUnique();
    }
}

public sealed class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.ToTable("PurchaseOrders", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PurchaseOrderNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PurchaseOrderNo }).IsUnique();
    }
}

public sealed class PurchaseOrderLineConfiguration : IEntityTypeConfiguration<PurchaseOrderLine>
{
    public void Configure(EntityTypeBuilder<PurchaseOrderLine> builder)
    {
        builder.ToTable("PurchaseOrderLines", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.OrderedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.UnitPrice).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.DiscountPercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.DiscountAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxPercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.TaxAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.LineAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.PurchaseOrderId, entity.LineNo }).IsUnique();
    }
}

public sealed class SubcontractOrderConfiguration : IEntityTypeConfiguration<SubcontractOrder>
{
    public void Configure(EntityTypeBuilder<SubcontractOrder> builder)
    {
        builder.ToTable("SubcontractOrders", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SubcontractOrderNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.SubcontractOrderNo }).IsUnique();
    }
}

public sealed class SubcontractReceiptConfiguration : IEntityTypeConfiguration<SubcontractReceipt>
{
    public void Configure(EntityTypeBuilder<SubcontractReceipt> builder)
    {
        builder.ToTable("SubcontractReceipts", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ReceiptNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ReceivedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.AcceptedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.RejectedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.QcStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.ReceiptNo }).IsUnique();
    }
}

public sealed class GoodsReceiptConfiguration : IEntityTypeConfiguration<GoodsReceipt>
{
    public void Configure(EntityTypeBuilder<GoodsReceipt> builder)
    {
        builder.ToTable("GoodsReceipts", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.GoodsReceiptNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.GoodsReceiptNo }).IsUnique();
    }
}

public sealed class GoodsReceiptLineConfiguration : IEntityTypeConfiguration<GoodsReceiptLine>
{
    public void Configure(EntityTypeBuilder<GoodsReceiptLine> builder)
    {
        builder.ToTable("GoodsReceiptLines", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ReceivedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.AcceptedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.RejectedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.UnitPrice).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxPercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.LineAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.QcStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.GoodsReceiptId, entity.LineNo }).IsUnique();
    }
}

public sealed class SupplierInvoiceConfiguration : IEntityTypeConfiguration<SupplierInvoice>
{
    public void Configure(EntityTypeBuilder<SupplierInvoice> builder)
    {
        builder.ToTable("SupplierInvoices", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SupplierInvoiceNo).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.CurrencyCode).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.SubtotalAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TotalAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.MatchStatus).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ApStatus).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.SupplierInvoiceNo }).IsUnique();
    }
}

public sealed class SupplierInvoiceLineConfiguration : IEntityTypeConfiguration<SupplierInvoiceLine>
{
    public void Configure(EntityTypeBuilder<SupplierInvoiceLine> builder)
    {
        builder.ToTable("SupplierInvoiceLines", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.InvoiceQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.UnitPrice).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxPercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.TaxAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.LineAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.MatchStatus).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.SupplierInvoiceId, entity.LineNo }).IsUnique();
    }
}

public sealed class AccountsPayableLiabilityConfiguration : IEntityTypeConfiguration<AccountsPayableLiability>
{
    public void Configure(EntityTypeBuilder<AccountsPayableLiability> builder)
    {
        builder.ToTable("AccountsPayableLiabilities", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.LiabilityNo).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.PayableAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.PaidAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.BalanceAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.LiabilityNo }).IsUnique();
    }
}

public sealed class AccountingPostingConfiguration : IEntityTypeConfiguration<AccountingPosting>
{
    public void Configure(EntityTypeBuilder<AccountingPosting> builder)
    {
        builder.ToTable("AccountingPostings", "finance");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PostingNo).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.DebitAccountCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.CreditAccountCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.Amount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PostingNo }).IsUnique();
    }
}
