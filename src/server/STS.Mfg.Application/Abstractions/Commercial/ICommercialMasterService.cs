using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Commercial;
using STS.Mfg.Application.Contracts.Masters;

namespace STS.Mfg.Application.Abstractions.Commercial;

public interface ICommercialMasterService
{
    Task<PagedResult<CurrencyDto>> ListCurrenciesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<CurrencyDto> CreateCurrencyAsync(CurrencyUpsertRequest request, CancellationToken cancellationToken = default);
    Task<CurrencyDto> UpdateCurrencyAsync(long id, CurrencyUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ExchangeRateSetupDto>> ListExchangeRatesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<ExchangeRateSetupDto> CreateExchangeRateAsync(ExchangeRateSetupUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ExchangeRateSetupDto> UpdateExchangeRateAsync(long id, ExchangeRateSetupUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<TaxCategoryDto>> ListTaxCategoriesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<TaxCategoryDto> CreateTaxCategoryAsync(TaxCategoryUpsertRequest request, CancellationToken cancellationToken = default);
    Task<TaxCategoryDto> UpdateTaxCategoryAsync(long id, TaxCategoryUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<PaymentTermDto>> ListPaymentTermsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<PaymentTermDto> CreatePaymentTermAsync(PaymentTermUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PaymentTermDto> UpdatePaymentTermAsync(long id, PaymentTermUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<TradeTermDto>> ListTradeTermsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<TradeTermDto> CreateTradeTermAsync(TradeTermUpsertRequest request, CancellationToken cancellationToken = default);
    Task<TradeTermDto> UpdateTradeTermAsync(long id, TradeTermUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<PriceListDto>> ListPriceListsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<PriceListDto> GetPriceListAsync(long id, CancellationToken cancellationToken = default);
    Task<PriceListDto> CreatePriceListAsync(PriceListUpsertRequest request, CancellationToken cancellationToken = default);
    Task<PriceListDto> UpdatePriceListAsync(long id, PriceListUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<DiscountSchemeDto>> ListDiscountSchemesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<DiscountSchemeDto> GetDiscountSchemeAsync(long id, CancellationToken cancellationToken = default);
    Task<DiscountSchemeDto> CreateDiscountSchemeAsync(DiscountSchemeUpsertRequest request, CancellationToken cancellationToken = default);
    Task<DiscountSchemeDto> UpdateDiscountSchemeAsync(long id, DiscountSchemeUpsertRequest request, CancellationToken cancellationToken = default);
}
