using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Measurements;
using STS.Mfg.Application.Contracts.Masters;

namespace STS.Mfg.Application.Abstractions.Measurements;

public interface IMeasurementService
{
    Task<PagedResult<UomClassDto>> ListUomClassesAsync(MeasurementFilter filter, CancellationToken cancellationToken = default);
    Task<UomClassDto> CreateUomClassAsync(UomClassUpsertRequest request, CancellationToken cancellationToken = default);
    Task<UomClassDto> UpdateUomClassAsync(long id, UomClassUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<UomDto>> ListUomsAsync(MeasurementFilter filter, CancellationToken cancellationToken = default);
    Task<UomDto> CreateUomAsync(UomUpsertRequest request, CancellationToken cancellationToken = default);
    Task<UomDto> UpdateUomAsync(long id, UomUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<UomConversionDto>> ListUomConversionsAsync(MeasurementFilter filter, CancellationToken cancellationToken = default);
    Task<UomConversionDto> CreateUomConversionAsync(UomConversionUpsertRequest request, CancellationToken cancellationToken = default);
    Task<UomConversionDto> UpdateUomConversionAsync(long id, UomConversionUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<MeasurementProfileDto>> ListMeasurementProfilesAsync(MeasurementFilter filter, CancellationToken cancellationToken = default);
    Task<MeasurementProfileDto> CreateMeasurementProfileAsync(MeasurementProfileUpsertRequest request, CancellationToken cancellationToken = default);
    Task<MeasurementProfileDto> UpdateMeasurementProfileAsync(long id, MeasurementProfileUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<MeasurementFormulaDto>> ListMeasurementFormulasAsync(MeasurementFilter filter, CancellationToken cancellationToken = default);
    Task<MeasurementFormulaDto> CreateMeasurementFormulaAsync(MeasurementFormulaUpsertRequest request, CancellationToken cancellationToken = default);
    Task<MeasurementFormulaDto> UpdateMeasurementFormulaAsync(long id, MeasurementFormulaUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ItemDto>> ListItemsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<ItemDto> GetItemAsync(long id, CancellationToken cancellationToken = default);
    Task<ItemMasterProfileDto> GetItemMasterProfileAsync(long itemId, CancellationToken cancellationToken = default);
    Task<ItemMasterProfileDto> UpdateItemMasterProfileAsync(long itemId, ItemMasterProfileUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ItemDto> CreateItemAsync(ItemUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ItemDto> UpdateItemAsync(long id, ItemUpsertRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ItemLookupDto>> LookupItemsAsync(long? companyId, string? search, CancellationToken cancellationToken = default);

    Task<PagedResult<ItemAttributeDto>> ListItemAttributesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<ItemAttributeDto> GetItemAttributeAsync(long id, CancellationToken cancellationToken = default);
    Task<ItemAttributeDto> CreateItemAttributeAsync(ItemAttributeUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ItemAttributeDto> UpdateItemAttributeAsync(long id, ItemAttributeUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ItemVariantDto>> ListItemVariantsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<ItemVariantDto> CreateItemVariantAsync(ItemVariantUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ItemVariantDto> UpdateItemVariantAsync(long id, ItemVariantUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ItemUomDto>> ListItemUomsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<ItemUomDto> CreateItemUomAsync(ItemUomUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ItemUomDto> UpdateItemUomAsync(long id, ItemUomUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ItemBarcodeDto>> ListItemBarcodesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default);
    Task<ItemBarcodeDto> CreateItemBarcodeAsync(ItemBarcodeUpsertRequest request, CancellationToken cancellationToken = default);
    Task<ItemBarcodeDto> UpdateItemBarcodeAsync(long id, ItemBarcodeUpsertRequest request, CancellationToken cancellationToken = default);
    Task<BarcodeResolutionDto> ResolveBarcodeAsync(string barcodeValue, CancellationToken cancellationToken = default);
}
