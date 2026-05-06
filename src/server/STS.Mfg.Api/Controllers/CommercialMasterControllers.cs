using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Commercial;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Commercial;
using STS.Mfg.Application.Contracts.Masters;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/commercial/currencies")]
public sealed class CurrenciesController(ICommercialMasterService commercialMasterService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<CurrencyDto>>>> List([FromQuery] CompanyScopedFilter filter, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.ListCurrenciesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<CurrencyDto>>> Create([FromBody] CurrencyUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.CreateCurrencyAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(List), null, response, "Currency created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<CurrencyDto>>> Update(long id, [FromBody] CurrencyUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.UpdateCurrencyAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Currency updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/commercial/exchange-rates")]
public sealed class ExchangeRatesController(ICommercialMasterService commercialMasterService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ExchangeRateSetupDto>>>> List([FromQuery] CompanyScopedFilter filter, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.ListExchangeRatesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<ExchangeRateSetupDto>>> Create([FromBody] ExchangeRateSetupUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.CreateExchangeRateAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(List), null, response, "Exchange-rate setup created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ExchangeRateSetupDto>>> Update(long id, [FromBody] ExchangeRateSetupUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.UpdateExchangeRateAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Exchange-rate setup updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/commercial/tax-categories")]
public sealed class TaxCategoriesController(ICommercialMasterService commercialMasterService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<TaxCategoryDto>>>> List([FromQuery] CompanyScopedFilter filter, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.ListTaxCategoriesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<TaxCategoryDto>>> Create([FromBody] TaxCategoryUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.CreateTaxCategoryAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(List), null, response, "Tax category created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<TaxCategoryDto>>> Update(long id, [FromBody] TaxCategoryUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.UpdateTaxCategoryAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Tax category updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/commercial/payment-terms")]
public sealed class PaymentTermsController(ICommercialMasterService commercialMasterService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<PaymentTermDto>>>> List([FromQuery] CompanyScopedFilter filter, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.ListPaymentTermsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<PaymentTermDto>>> Create([FromBody] PaymentTermUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.CreatePaymentTermAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(List), null, response, "Payment term created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PaymentTermDto>>> Update(long id, [FromBody] PaymentTermUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.UpdatePaymentTermAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Payment term updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/commercial/trade-terms")]
public sealed class TradeTermsController(ICommercialMasterService commercialMasterService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<TradeTermDto>>>> List([FromQuery] CompanyScopedFilter filter, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.ListTradeTermsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<TradeTermDto>>> Create([FromBody] TradeTermUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.CreateTradeTermAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(List), null, response, "Trade term created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<TradeTermDto>>> Update(long id, [FromBody] TradeTermUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.UpdateTradeTermAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Trade term updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/commercial/price-lists")]
public sealed class PriceListsController(ICommercialMasterService commercialMasterService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<PriceListDto>>>> List([FromQuery] CompanyScopedFilter filter, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.ListPriceListsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PriceListDto>>> GetPriceList(long id, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.GetPriceListAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<PriceListDto>>> Create([FromBody] PriceListUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.CreatePriceListAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetPriceList), new { id = response.Id }, response, "Price list created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<PriceListDto>>> Update(long id, [FromBody] PriceListUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.UpdatePriceListAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Price list updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/commercial/discount-schemes")]
public sealed class DiscountSchemesController(ICommercialMasterService commercialMasterService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<DiscountSchemeDto>>>> List([FromQuery] CompanyScopedFilter filter, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.ListDiscountSchemesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<DiscountSchemeDto>>> GetDiscountScheme(long id, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.GetDiscountSchemeAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<DiscountSchemeDto>>> Create([FromBody] DiscountSchemeUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.CreateDiscountSchemeAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetDiscountScheme), new { id = response.Id }, response, "Discount scheme created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<DiscountSchemeDto>>> Update(long id, [FromBody] DiscountSchemeUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await commercialMasterService.UpdateDiscountSchemeAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Discount scheme updated.");
    }
}
