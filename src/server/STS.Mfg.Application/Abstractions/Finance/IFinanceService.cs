using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Finance;
using STS.Mfg.Application.Contracts.Procurement;

namespace STS.Mfg.Application.Abstractions.Finance;

public interface IFinanceService
{
    Task<PagedResult<ChartOfAccountDto>> ListAccountsAsync(FinanceFilter filter, CancellationToken cancellationToken = default);
    Task<ChartOfAccountDto> CreateAccountAsync(ChartOfAccountUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<FiscalPeriodDto>> ListFiscalPeriodsAsync(FinanceFilter filter, CancellationToken cancellationToken = default);
    Task<FiscalPeriodDto> CreateFiscalPeriodAsync(FiscalPeriodUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<PostingProfileDto>> ListPostingProfilesAsync(FinanceFilter filter, CancellationToken cancellationToken = default);
    Task<PostingProfileDto> CreatePostingProfileAsync(PostingProfileUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<JournalDto>> ListJournalsAsync(FinanceFilter filter, CancellationToken cancellationToken = default);
    Task<JournalDto> CreateJournalAsync(JournalUpsertRequest request, CancellationToken cancellationToken = default);
    Task<JournalDto> PostJournalAsync(long id, CancellationToken cancellationToken = default);
    Task<JournalDto> ReverseJournalAsync(long id, string reason, CancellationToken cancellationToken = default);
    Task<SupplierInvoicePostingResultDto> PostSupplierInvoiceAsync(long supplierInvoiceId, CancellationToken cancellationToken = default);
    Task<PagedResult<ArInvoiceDto>> ListArInvoicesAsync(FinanceFilter filter, CancellationToken cancellationToken = default);
    Task<ArInvoiceDto> CreateArInvoiceFromShipmentAsync(ArInvoiceFromShipmentRequest request, CancellationToken cancellationToken = default);
    Task<ArInvoicePostingResultDto> PostArInvoiceAsync(long id, CancellationToken cancellationToken = default);
    Task<PagedResult<TaxLedgerEntryDto>> ListTaxLedgerAsync(FinanceFilter filter, CancellationToken cancellationToken = default);
    Task<PagedResult<InventoryValuationEntryDto>> ListInventoryValuationAsync(FinanceFilter filter, CancellationToken cancellationToken = default);
}
