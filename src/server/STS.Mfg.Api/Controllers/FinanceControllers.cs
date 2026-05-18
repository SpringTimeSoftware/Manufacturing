using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Finance;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Finance;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/finance")]
public sealed class FinanceController(IFinanceService financeService) : ApiControllerBase
{
    [HttpGet("chart-of-accounts")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ChartOfAccountDto>>>> ListAccounts([FromQuery] FinanceFilter filter, CancellationToken cancellationToken)
    {
        var response = await financeService.ListAccountsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("chart-of-accounts")]
    public async Task<ActionResult<ApiEnvelope<ChartOfAccountDto>>> CreateAccount([FromBody] ChartOfAccountUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await financeService.CreateAccountAsync(request, cancellationToken);
        return OkEnvelope(response, "Account created.");
    }

    [HttpGet("fiscal-periods")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<FiscalPeriodDto>>>> ListPeriods([FromQuery] FinanceFilter filter, CancellationToken cancellationToken)
    {
        var response = await financeService.ListFiscalPeriodsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("fiscal-periods")]
    public async Task<ActionResult<ApiEnvelope<FiscalPeriodDto>>> CreatePeriod([FromBody] FiscalPeriodUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await financeService.CreateFiscalPeriodAsync(request, cancellationToken);
        return OkEnvelope(response, "Fiscal period created.");
    }

    [HttpGet("posting-profiles")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<PostingProfileDto>>>> ListProfiles([FromQuery] FinanceFilter filter, CancellationToken cancellationToken)
    {
        var response = await financeService.ListPostingProfilesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("posting-profiles")]
    public async Task<ActionResult<ApiEnvelope<PostingProfileDto>>> CreateProfile([FromBody] PostingProfileUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await financeService.CreatePostingProfileAsync(request, cancellationToken);
        return OkEnvelope(response, "Posting profile created.");
    }

    [HttpGet("journals")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<JournalDto>>>> ListJournals([FromQuery] FinanceFilter filter, CancellationToken cancellationToken)
    {
        var response = await financeService.ListJournalsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("journals")]
    public async Task<ActionResult<ApiEnvelope<JournalDto>>> CreateJournal([FromBody] JournalUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await financeService.CreateJournalAsync(request, cancellationToken);
        return OkEnvelope(response, "Journal created.");
    }

    [HttpPost("journals/{id:long}/post")]
    public async Task<ActionResult<ApiEnvelope<JournalDto>>> PostJournal(long id, CancellationToken cancellationToken)
    {
        var response = await financeService.PostJournalAsync(id, cancellationToken);
        return OkEnvelope(response, "Journal posted.");
    }

    [HttpPost("journals/{id:long}/reverse")]
    public async Task<ActionResult<ApiEnvelope<JournalDto>>> ReverseJournal(long id, [FromBody] JournalReverseRequest request, CancellationToken cancellationToken)
    {
        var response = await financeService.ReverseJournalAsync(id, request.Reason, cancellationToken);
        return OkEnvelope(response, "Journal reversed.");
    }

    [HttpGet("ar-invoices")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ArInvoiceDto>>>> ListArInvoices([FromQuery] FinanceFilter filter, CancellationToken cancellationToken)
    {
        var response = await financeService.ListArInvoicesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("ar-invoices/from-shipment")]
    public async Task<ActionResult<ApiEnvelope<ArInvoiceDto>>> CreateArInvoiceFromShipment([FromBody] ArInvoiceFromShipmentRequest request, CancellationToken cancellationToken)
    {
        var response = await financeService.CreateArInvoiceFromShipmentAsync(request, cancellationToken);
        return OkEnvelope(response, "AR invoice created from shipment.");
    }

    [HttpPost("ar-invoices/{id:long}/post")]
    public async Task<ActionResult<ApiEnvelope<ArInvoicePostingResultDto>>> PostArInvoice(long id, CancellationToken cancellationToken)
    {
        var response = await financeService.PostArInvoiceAsync(id, cancellationToken);
        return OkEnvelope(response, "AR invoice posted.");
    }

    [HttpGet("tax-ledger")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<TaxLedgerEntryDto>>>> ListTaxLedger([FromQuery] FinanceFilter filter, CancellationToken cancellationToken)
    {
        var response = await financeService.ListTaxLedgerAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("inventory-valuation")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<InventoryValuationEntryDto>>>> ListInventoryValuation([FromQuery] FinanceFilter filter, CancellationToken cancellationToken)
    {
        var response = await financeService.ListInventoryValuationAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }
}

public sealed record JournalReverseRequest(string Reason);
