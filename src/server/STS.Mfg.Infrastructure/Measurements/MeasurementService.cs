using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Measurements;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Masters;
using STS.Mfg.Application.Contracts.Measurements;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Measurements;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Measurements;

internal sealed class MeasurementService(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IMeasurementService
{
    public async Task<PagedResult<UomClassDto>> ListUomClassesAsync(MeasurementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.UomClasses.AsNoTracking();
        query = ApplyUomClassFilters(query, filter);

        var page = await query.OrderBy(entity => entity.ClassCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapUomClass);
    }

    public async Task<UomClassDto> CreateUomClassAsync(UomClassUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUomClass(request);

        var entity = UomClass.Create(
            request.ClassCode,
            request.ClassName,
            request.BaseUomId,
            request.SupportsFormulaConversion,
            request.Status,
            GetUserId());

        DbContext.UomClasses.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapUomClass(entity);
        await WriteAuditAsync("measurements", nameof(UomClass), "uomclass.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<UomClassDto> UpdateUomClassAsync(long id, UomClassUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUomClass(request);

        var entity = await DbContext.UomClasses.FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "UOM class was not found.", "measurements.uomclass_not_found");

        var before = MapUomClass(entity);
        entity.Update(request.ClassCode, request.ClassName, request.BaseUomId, request.SupportsFormulaConversion, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapUomClass(entity);
        await WriteAuditAsync("measurements", nameof(UomClass), "uomclass.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<UomDto>> ListUomsAsync(MeasurementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.Uoms.AsNoTracking();
        query = ApplyUomFilters(query, filter);

        var page = await query.OrderBy(entity => entity.UomCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapUom);
    }

    public async Task<UomDto> CreateUomAsync(UomUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUom(request);

        var entity = Uom.Create(
            request.UomCode,
            request.UomName,
            Normalize(request.Symbol),
            request.UomClassId,
            request.DecimalPrecision,
            request.IsSystemBase,
            request.Status,
            GetUserId());

        DbContext.Uoms.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapUom(entity);
        await WriteAuditAsync("measurements", nameof(Uom), "uom.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<UomDto> UpdateUomAsync(long id, UomUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUom(request);

        var entity = await DbContext.Uoms.FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "UOM was not found.", "measurements.uom_not_found");
        ThrowIfInvalid(Immutable(entity.UomClassId, request.UomClassId, nameof(request.UomClassId), "UOM class cannot be changed."));

        var before = MapUom(entity);
        entity.Update(request.UomCode, request.UomName, Normalize(request.Symbol), request.DecimalPrecision, request.IsSystemBase, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapUom(entity);
        await WriteAuditAsync("measurements", nameof(Uom), "uom.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<UomConversionDto>> ListUomConversionsAsync(MeasurementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.UomConversions.AsNoTracking();
        query = ApplyUomConversionFilters(query, filter);

        var page = await query.OrderBy(entity => entity.FromUomId).ThenBy(entity => entity.ToUomId).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapUomConversion);
    }

    public async Task<UomConversionDto> CreateUomConversionAsync(UomConversionUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUomConversion(request);

        var entity = UomConversion.Create(
            request.FromUomId,
            request.ToUomId,
            request.ConversionMode,
            request.FactorNumerator,
            request.FactorDenominator,
            Normalize(request.FormulaTokenSet),
            request.RoundMode,
            request.PrecisionScale,
            request.Status,
            GetUserId());

        DbContext.UomConversions.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapUomConversion(entity);
        await WriteAuditAsync("measurements", nameof(UomConversion), "uomconversion.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<UomConversionDto> UpdateUomConversionAsync(long id, UomConversionUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateUomConversion(request);

        var entity = await DbContext.UomConversions.FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "UOM conversion was not found.", "measurements.uomconversion_not_found");
        ThrowIfInvalid(
            Immutable(entity.FromUomId, request.FromUomId, nameof(request.FromUomId), "From UOM cannot be changed."),
            Immutable(entity.ToUomId, request.ToUomId, nameof(request.ToUomId), "To UOM cannot be changed."));

        var before = MapUomConversion(entity);
        entity.Update(request.ConversionMode, request.FactorNumerator, request.FactorDenominator, Normalize(request.FormulaTokenSet), request.RoundMode, request.PrecisionScale, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapUomConversion(entity);
        await WriteAuditAsync("measurements", nameof(UomConversion), "uomconversion.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<MeasurementProfileDto>> ListMeasurementProfilesAsync(MeasurementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.MeasurementProfiles.AsNoTracking();
        query = ApplyMeasurementProfileFilters(query, filter);

        var page = await query.OrderBy(entity => entity.ProfileCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapMeasurementProfile);
    }

    public async Task<MeasurementProfileDto> CreateMeasurementProfileAsync(MeasurementProfileUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMeasurementProfile(request);

        var entity = MeasurementProfile.Create(
            request.ProfileCode,
            request.ProfileName,
            request.ProfileType,
            request.StockUomClassId,
            request.AllowsCatchWeight,
            request.RequiresDimensions,
            request.RequiresDensity,
            request.RequiresThickness,
            request.RequiresPackSize,
            request.SupportsCommercialProductionSplit,
            request.Status,
            GetUserId());

        DbContext.MeasurementProfiles.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapMeasurementProfile(entity);
        await WriteAuditAsync("measurements", nameof(MeasurementProfile), "profile.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<MeasurementProfileDto> UpdateMeasurementProfileAsync(long id, MeasurementProfileUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMeasurementProfile(request);

        var entity = await DbContext.MeasurementProfiles.FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Measurement profile was not found.", "measurements.profile_not_found");
        ThrowIfInvalid(Immutable(entity.StockUomClassId, request.StockUomClassId, nameof(request.StockUomClassId), "Stock UOM class cannot be changed."));

        var before = MapMeasurementProfile(entity);
        entity.Update(
            request.ProfileCode,
            request.ProfileName,
            request.ProfileType,
            request.AllowsCatchWeight,
            request.RequiresDimensions,
            request.RequiresDensity,
            request.RequiresThickness,
            request.RequiresPackSize,
            request.SupportsCommercialProductionSplit,
            request.Status,
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapMeasurementProfile(entity);
        await WriteAuditAsync("measurements", nameof(MeasurementProfile), "profile.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<MeasurementFormulaDto>> ListMeasurementFormulasAsync(MeasurementFilter filter, CancellationToken cancellationToken = default)
    {
        var query = DbContext.MeasurementFormulas.AsNoTracking();
        query = ApplyMeasurementFormulaFilters(query, filter);

        var page = await query.OrderBy(entity => entity.FormulaCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapMeasurementFormula);
    }

    public async Task<MeasurementFormulaDto> CreateMeasurementFormulaAsync(MeasurementFormulaUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMeasurementFormula(request);

        var entity = MeasurementFormula.Create(
            request.MeasurementProfileId,
            request.FormulaCode,
            request.FormulaName,
            request.FormulaPurpose,
            request.ExpressionTemplate,
            request.OutputUomId,
            request.PrecisionScale,
            request.Status,
            GetUserId());

        DbContext.MeasurementFormulas.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapMeasurementFormula(entity);
        await WriteAuditAsync("measurements", nameof(MeasurementFormula), "formula.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<MeasurementFormulaDto> UpdateMeasurementFormulaAsync(long id, MeasurementFormulaUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateMeasurementFormula(request);

        var entity = await DbContext.MeasurementFormulas.FirstOrDefaultAsync(record => record.Id == id, cancellationToken);
        entity = EnsureFound(entity, "Measurement formula was not found.", "measurements.formula_not_found");
        ThrowIfInvalid(
            Immutable(entity.MeasurementProfileId, request.MeasurementProfileId, nameof(request.MeasurementProfileId), "Measurement profile cannot be changed."),
            Immutable(entity.OutputUomId, request.OutputUomId, nameof(request.OutputUomId), "Output UOM cannot be changed."));

        var before = MapMeasurementFormula(entity);
        entity.Update(request.FormulaCode, request.FormulaName, request.FormulaPurpose, request.ExpressionTemplate, request.PrecisionScale, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapMeasurementFormula(entity);
        await WriteAuditAsync("measurements", nameof(MeasurementFormula), "formula.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ItemDto>> ListItemsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Items.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        query = ApplyItemFilters(query, filter);

        var page = await query.OrderBy(entity => entity.ItemCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapItem);
    }

    public async Task<ItemDto> GetItemAsync(long id, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var entity = await DbContext.Items.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        return MapItem(EnsureFound(entity, "Item was not found in the active scope.", "master.item_not_found"));
    }

    public async Task<ItemMasterProfileDto> GetItemMasterProfileAsync(long itemId, CancellationToken cancellationToken = default)
    {
        await RequireItemAsync(itemId, cancellationToken);

        var scope = GetScope();
        var aliases = await DbContext.ItemAliases.AsNoTracking()
            .ApplyCompanyScope(scope)
            .Where(entity => entity.ItemId == itemId)
            .OrderByDescending(entity => entity.IsPrimary)
            .ThenBy(entity => entity.AliasType)
            .ToArrayAsync(cancellationToken);

        var media = await DbContext.ItemMedia.AsNoTracking()
            .ApplyCompanyScope(scope)
            .Where(entity => entity.ItemId == itemId)
            .OrderByDescending(entity => entity.IsPrimary)
            .ThenBy(entity => entity.SortOrder)
            .ToArrayAsync(cancellationToken);

        var documents = await DbContext.ItemDocuments.AsNoTracking()
            .ApplyCompanyScope(scope)
            .Where(entity => entity.ItemId == itemId)
            .OrderBy(entity => entity.DocumentType)
            .ThenBy(entity => entity.Title)
            .ToArrayAsync(cancellationToken);

        var catalog = await DbContext.ItemCatalog.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.ItemId == itemId, cancellationToken);

        var packaging = await DbContext.ItemPackaging.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.ItemId == itemId, cancellationToken);

        var physicalSpecs = await DbContext.ItemPhysicalSpecs.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.ItemId == itemId, cancellationToken);

        var customerReferences = await DbContext.ItemCustomerReferences.AsNoTracking()
            .ApplyCompanyScope(scope)
            .Where(entity => entity.ItemId == itemId)
            .OrderBy(entity => entity.CustomerItemCode)
            .ToArrayAsync(cancellationToken);

        var vendorReferences = await DbContext.ItemVendorReferences.AsNoTracking()
            .ApplyCompanyScope(scope)
            .Where(entity => entity.ItemId == itemId)
            .OrderBy(entity => entity.VendorItemCode)
            .ToArrayAsync(cancellationToken);

        var customerIds = customerReferences.Select(reference => reference.CustomerId).Distinct().ToArray();
        var customers = customerIds.Length == 0
            ? new Dictionary<long, Customer>()
            : await DbContext.Customers.AsNoTracking()
                .ApplyCompanyScope(scope)
                .Where(customer => customerIds.Contains(customer.Id))
                .ToDictionaryAsync(customer => customer.Id, cancellationToken);

        var supplierIds = vendorReferences.Select(reference => reference.SupplierId).Distinct().ToArray();
        var suppliers = supplierIds.Length == 0
            ? new Dictionary<long, Supplier>()
            : await DbContext.Suppliers.AsNoTracking()
                .ApplyCompanyScope(scope)
                .Where(supplier => supplierIds.Contains(supplier.Id))
                .ToDictionaryAsync(supplier => supplier.Id, cancellationToken);

        var manufacturingPolicy = await DbContext.ItemManufacturingPolicies.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.ItemId == itemId, cancellationToken);

        var planningPolicy = await DbContext.ItemPlanningPolicies.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.ItemId == itemId, cancellationToken);

        var inventoryPolicy = await DbContext.ItemInventoryPolicies.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.ItemId == itemId, cancellationToken);

        var qualityPolicy = await DbContext.ItemQualityPolicies.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(entity => entity.ItemId == itemId, cancellationToken);

        return new ItemMasterProfileDto(
            itemId,
            aliases.Select(MapItemAlias).ToArray(),
            media.Select(MapItemMedia).ToArray(),
            documents.Select(MapItemDocument).ToArray(),
            catalog is null ? null : MapItemCatalog(catalog),
            packaging is null ? null : MapItemPackaging(packaging),
            physicalSpecs is null ? null : MapItemPhysicalSpecs(physicalSpecs),
            customerReferences.Select(reference => MapItemCustomerReference(reference, customers)).ToArray(),
            vendorReferences.Select(reference => MapItemVendorReference(reference, suppliers)).ToArray(),
            manufacturingPolicy is null ? null : MapItemManufacturingPolicy(manufacturingPolicy),
            planningPolicy is null ? null : MapItemPlanningPolicy(planningPolicy),
            inventoryPolicy is null ? null : MapItemInventoryPolicy(inventoryPolicy),
            qualityPolicy is null ? null : MapItemQualityPolicy(qualityPolicy));
    }

    public async Task<ItemMasterProfileDto> UpdateItemMasterProfileAsync(long itemId, ItemMasterProfileUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateItemMasterProfile(request);

        var item = await RequireItemAsync(itemId, cancellationToken);
        var companyId = item.CompanyId ?? 0;
        EnsureContextAccess(companyId, null);
        EnsureWarehouseAccess(request.InventoryPolicy.DefaultWarehouseId);

        var before = await GetItemMasterProfileAsync(itemId, cancellationToken);
        var userId = GetUserId();

        await ReplaceItemAliasesAsync(companyId, itemId, request.Aliases, userId, cancellationToken);
        await UpsertItemCatalogAsync(companyId, itemId, request.Catalog, userId, cancellationToken);
        await UpsertItemPackagingAsync(companyId, itemId, request.Packaging, userId, cancellationToken);
        await UpsertItemPhysicalSpecsAsync(companyId, itemId, request.PhysicalSpecs, userId, cancellationToken);
        await UpsertItemManufacturingPolicyAsync(companyId, itemId, request.ManufacturingPolicy, userId, cancellationToken);
        await UpsertItemPlanningPolicyAsync(companyId, itemId, request.PlanningPolicy, userId, cancellationToken);
        await UpsertItemInventoryPolicyAsync(companyId, itemId, request.InventoryPolicy, userId, cancellationToken);
        await UpsertItemQualityPolicyAsync(companyId, itemId, request.QualityPolicy, userId, cancellationToken);
        await ReplaceItemCustomerReferencesAsync(companyId, itemId, request.CustomerReferences, userId, cancellationToken);
        await ReplaceItemVendorReferencesAsync(companyId, itemId, request.VendorReferences, userId, cancellationToken);

        await DbContext.SaveChangesAsync(cancellationToken);

        var after = await GetItemMasterProfileAsync(itemId, cancellationToken);
        await WriteAuditAsync("masters", nameof(Item), "item.profile.update", itemId, before, after, cancellationToken);
        return after;
    }

    public async Task<ItemDto> CreateItemAsync(ItemUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateItem(request);
        EnsureContextAccess(request.CompanyId, null);
        EnsureWarehouseAccess(request.DefaultWarehouseId);

        var entity = Item.Create(
            request.CompanyId,
            request.ItemCode,
            request.ItemName,
            Normalize(request.ShortName),
            request.ItemType,
            request.ItemGroupId,
            request.MeasurementProfileId,
            request.StockUomId,
            request.PurchaseUomId,
            request.SalesUomId,
            request.ProductionUomId,
            request.QcUomId,
            request.TraceabilityMode,
            request.IsCatchWeightItem,
            request.IsQcRequired,
            request.IsBatchExpiryTracked,
            request.DefaultIssueMethod,
            request.DefaultMakeType,
            request.DefaultWarehouseId,
            request.DefaultBinId,
            request.LeadTimeDays,
            request.ReorderPolicy,
            request.Status,
            GetUserId());

        DbContext.Items.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapItem(entity);
        await WriteAuditAsync("masters", nameof(Item), "item.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ItemDto> UpdateItemAsync(long id, ItemUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateItem(request);

        var scope = GetScope();
        var entity = await DbContext.Items.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Item was not found in the active scope.", "master.item_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Item company cannot be changed."),
            Immutable(entity.ItemGroupId, request.ItemGroupId, nameof(request.ItemGroupId), "Item group cannot be changed."),
            Immutable(entity.MeasurementProfileId, request.MeasurementProfileId, nameof(request.MeasurementProfileId), "Measurement profile cannot be changed."),
            Immutable(entity.StockUomId, request.StockUomId, nameof(request.StockUomId), "Stock UOM cannot be changed."));

        EnsureWarehouseAccess(request.DefaultWarehouseId);

        var before = MapItem(entity);
        entity.Update(
            request.ItemCode,
            request.ItemName,
            Normalize(request.ShortName),
            request.ItemType,
            request.PurchaseUomId,
            request.SalesUomId,
            request.ProductionUomId,
            request.QcUomId,
            request.TraceabilityMode,
            request.IsCatchWeightItem,
            request.IsQcRequired,
            request.IsBatchExpiryTracked,
            request.DefaultIssueMethod,
            request.DefaultMakeType,
            request.DefaultWarehouseId,
            request.DefaultBinId,
            request.LeadTimeDays,
            request.ReorderPolicy,
            request.Status,
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapItem(entity);
        await WriteAuditAsync("masters", nameof(Item), "item.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<IReadOnlyCollection<ItemLookupDto>> LookupItemsAsync(long? companyId, string? search, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Items.AsNoTracking().ApplyCompanyScope(scope);

        if (companyId.HasValue)
        {
            query = query.Where(item => item.CompanyId == companyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(item => item.ItemCode.Contains(term) || item.ItemName.Contains(term));
        }

        return await query
            .OrderBy(item => item.ItemCode)
            .Take(30)
            .Select(item => new ItemLookupDto(item.Id, item.ItemCode, item.ItemName, item.ItemType, item.Status))
            .ToArrayAsync(cancellationToken);
    }

    public async Task<PagedResult<ItemVariantDto>> ListItemVariantsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.ItemVariants.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        query = ApplyItemVariantFilters(query, filter);

        var page = await query.OrderBy(entity => entity.VariantCode).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapItemVariant);
    }

    public async Task<ItemVariantDto> CreateItemVariantAsync(ItemVariantUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateItemVariant(request);
        EnsureContextAccess(request.CompanyId, null);

        var item = await RequireItemAsync(request.ItemId, cancellationToken);
        ThrowIfInvalid(Immutable(item.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Variant company must match the parent item."));

        var entity = ItemVariant.Create(
            request.CompanyId,
            request.ItemId,
            request.VariantCode,
            request.VariantName,
            request.VariantKey,
            Normalize(request.VariantAttributeSummary),
            request.VariantAttributeMapJson,
            request.OverrideMeasurementProfileId,
            request.OverrideStockUomId,
            request.OverrideWeightPerUnit,
            request.Status,
            GetUserId());

        DbContext.ItemVariants.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapItemVariant(entity);
        await WriteAuditAsync("masters", nameof(ItemVariant), "itemvariant.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ItemVariantDto> UpdateItemVariantAsync(long id, ItemVariantUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateItemVariant(request);

        var scope = GetScope();
        var entity = await DbContext.ItemVariants.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Item variant was not found in the active scope.", "master.itemvariant_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Variant company cannot be changed."),
            Immutable(entity.ItemId, request.ItemId, nameof(request.ItemId), "Parent item cannot be changed."));

        var before = MapItemVariant(entity);
        entity.Update(
            request.VariantCode,
            request.VariantName,
            request.VariantKey,
            Normalize(request.VariantAttributeSummary),
            request.VariantAttributeMapJson,
            request.OverrideMeasurementProfileId,
            request.OverrideStockUomId,
            request.OverrideWeightPerUnit,
            request.Status,
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapItemVariant(entity);
        await WriteAuditAsync("masters", nameof(ItemVariant), "itemvariant.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ItemUomDto>> ListItemUomsAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.ItemUoms.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        query = ApplyItemUomFilters(query, filter);

        var page = await query.OrderBy(entity => entity.ItemId).ThenBy(entity => entity.UomRole).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapItemUom);
    }

    public async Task<ItemUomDto> CreateItemUomAsync(ItemUomUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateItemUom(request);
        EnsureContextAccess(request.CompanyId, null);

        var item = await RequireItemAsync(request.ItemId, cancellationToken);
        ThrowIfInvalid(Immutable(item.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Item UOM company must match the parent item."));

        var entity = ItemUom.Create(
            request.CompanyId,
            request.ItemId,
            request.ItemVariantId,
            request.UomRole,
            request.UomId,
            request.BaseToThisNumerator,
            request.BaseToThisDenominator,
            request.MeasurementFormulaId,
            request.IsDefault,
            request.IsCatchWeightActualUom,
            request.MinOrderQty,
            request.RoundingScale,
            request.Status,
            GetUserId());

        DbContext.ItemUoms.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapItemUom(entity);
        await WriteAuditAsync("masters", nameof(ItemUom), "itemuom.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ItemUomDto> UpdateItemUomAsync(long id, ItemUomUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateItemUom(request);

        var scope = GetScope();
        var entity = await DbContext.ItemUoms.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Item UOM was not found in the active scope.", "master.itemuom_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Item UOM company cannot be changed."),
            Immutable(entity.ItemId, request.ItemId, nameof(request.ItemId), "Parent item cannot be changed."),
            Immutable(entity.ItemVariantId, request.ItemVariantId, nameof(request.ItemVariantId), "Parent item variant cannot be changed."),
            Immutable(entity.UomId, request.UomId, nameof(request.UomId), "UOM cannot be changed."));

        var before = MapItemUom(entity);
        entity.Update(
            request.UomRole,
            request.BaseToThisNumerator,
            request.BaseToThisDenominator,
            request.MeasurementFormulaId,
            request.IsDefault,
            request.IsCatchWeightActualUom,
            request.MinOrderQty,
            request.RoundingScale,
            request.Status,
            GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapItemUom(entity);
        await WriteAuditAsync("masters", nameof(ItemUom), "itemuom.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<PagedResult<ItemBarcodeDto>> ListItemBarcodesAsync(CompanyScopedFilter filter, CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.ItemBarcodes.AsNoTracking().ApplyCompanyScope(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        query = ApplyItemBarcodeFilters(query, filter);

        var page = await query.OrderBy(entity => entity.BarcodeValue).ToPagedResultAsync(filter, cancellationToken);
        return MapPage(page, MapItemBarcode);
    }

    public async Task<ItemBarcodeDto> CreateItemBarcodeAsync(ItemBarcodeUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateItemBarcode(request);
        EnsureContextAccess(request.CompanyId, null);

        var item = await RequireItemAsync(request.ItemId, cancellationToken);
        ThrowIfInvalid(Immutable(item.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Barcode company must match the parent item."));

        var entity = ItemBarcode.Create(
            request.CompanyId,
            request.ItemId,
            request.ItemVariantId,
            request.UomId,
            request.BarcodeValue,
            request.BarcodeType,
            request.ScanPurpose,
            request.PreferenceRank,
            request.IsPrimary,
            request.Status,
            GetUserId());

        DbContext.ItemBarcodes.Add(entity);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapItemBarcode(entity);
        await WriteAuditAsync("masters", nameof(ItemBarcode), "itembarcode.create", entity.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<ItemBarcodeDto> UpdateItemBarcodeAsync(long id, ItemBarcodeUpsertRequest request, CancellationToken cancellationToken = default)
    {
        ValidateItemBarcode(request);

        var scope = GetScope();
        var entity = await DbContext.ItemBarcodes.ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == id, cancellationToken);

        entity = EnsureFound(entity, "Item barcode was not found in the active scope.", "master.itembarcode_not_found");
        ThrowIfInvalid(
            Immutable(entity.CompanyId ?? 0, request.CompanyId, nameof(request.CompanyId), "Barcode company cannot be changed."),
            Immutable(entity.ItemId, request.ItemId, nameof(request.ItemId), "Parent item cannot be changed."),
            Immutable(entity.ItemVariantId, request.ItemVariantId, nameof(request.ItemVariantId), "Parent item variant cannot be changed."),
            Immutable(entity.UomId, request.UomId, nameof(request.UomId), "Barcode UOM cannot be changed."));

        var before = MapItemBarcode(entity);
        entity.Update(request.BarcodeValue, request.BarcodeType, request.ScanPurpose, request.PreferenceRank, request.IsPrimary, request.Status, GetUserId());
        await DbContext.SaveChangesAsync(cancellationToken);

        var after = MapItemBarcode(entity);
        await WriteAuditAsync("masters", nameof(ItemBarcode), "itembarcode.update", entity.Id, before, after, cancellationToken);
        return after;
    }

    public async Task<BarcodeResolutionDto> ResolveBarcodeAsync(string barcodeValue, CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(Required(barcodeValue, nameof(barcodeValue), "Barcode value is required."));

        var scope = GetScope();
        var entity = await DbContext.ItemBarcodes.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.BarcodeValue == barcodeValue.Trim(), cancellationToken);

        entity = EnsureFound(entity, "Barcode was not found in the active scope.", "master.barcode_not_found");
        var item = await DbContext.Items.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == entity.ItemId, cancellationToken);
        item = EnsureFound(item, "Parent item was not found in the active scope.", "master.item_not_found");

        ItemVariant? variant = null;
        if (entity.ItemVariantId.HasValue)
        {
            variant = await DbContext.ItemVariants.AsNoTracking()
                .ApplyCompanyScope(scope)
                .FirstOrDefaultAsync(record => record.Id == entity.ItemVariantId.Value, cancellationToken);
        }

        return new BarcodeResolutionDto(
            entity.Id,
            entity.ItemId,
            entity.ItemVariantId,
            entity.UomId,
            entity.BarcodeValue,
            entity.ScanPurpose,
            entity.Status,
            item.ItemCode,
            item.ItemName,
            variant?.VariantCode,
            variant?.VariantName);
    }

    private async Task<Item> RequireItemAsync(long itemId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.Items.AsNoTracking()
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.Id == itemId, cancellationToken);

        return EnsureFound(entity, "Parent item was not found in the active scope.", "master.item_not_found");
    }

    private async Task ReplaceItemAliasesAsync(long companyId, long itemId, IReadOnlyCollection<ItemAliasUpsertRequest> requests, long? userId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var existing = await DbContext.ItemAliases
            .ApplyCompanyScope(scope)
            .Where(entity => entity.ItemId == itemId)
            .ToArrayAsync(cancellationToken);

        DbContext.ItemAliases.RemoveRange(existing);

        foreach (var request in requests.Where(entry => !string.IsNullOrWhiteSpace(entry.AliasValue)))
        {
            DbContext.ItemAliases.Add(ItemAlias.Create(companyId, itemId, request.AliasType, request.AliasValue, Normalize(request.LanguageCode), request.IsPrimary, request.Status, userId));
        }
    }

    private async Task UpsertItemCatalogAsync(long companyId, long itemId, ItemCatalogUpsertRequest request, long? userId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.ItemCatalog
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.ItemId == itemId, cancellationToken);

        if (entity is null)
        {
            DbContext.ItemCatalog.Add(ItemCatalog.Create(companyId, itemId, request.CatalogTitle, Normalize(request.CatalogSection), Normalize(request.MarketingDescription), Normalize(request.CustomerVisibleSpecsJson), request.PublishStatus, request.IsCatalogVisible, request.EffectiveFrom, request.EffectiveTo, Normalize(request.PreviewSlug), request.Status, userId));
            return;
        }

        entity.Update(request.CatalogTitle, Normalize(request.CatalogSection), Normalize(request.MarketingDescription), Normalize(request.CustomerVisibleSpecsJson), request.PublishStatus, request.IsCatalogVisible, request.EffectiveFrom, request.EffectiveTo, Normalize(request.PreviewSlug), request.Status, userId);
    }

    private async Task UpsertItemPackagingAsync(long companyId, long itemId, ItemPackagingUpsertRequest request, long? userId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.ItemPackaging
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.ItemId == itemId, cancellationToken);

        if (entity is null)
        {
            DbContext.ItemPackaging.Add(ItemPackaging.Create(companyId, itemId, request.PackagingUomId, request.InnerPackQty, request.CartonQty, request.PalletQty, request.NetWeight, request.GrossWeight, request.WeightUomId, request.LengthValue, request.WidthValue, request.HeightValue, request.DimensionUomId, request.LabelCount, Normalize(request.PackingInstructions), request.Status, userId));
            return;
        }

        entity.Update(request.PackagingUomId, request.InnerPackQty, request.CartonQty, request.PalletQty, request.NetWeight, request.GrossWeight, request.WeightUomId, request.LengthValue, request.WidthValue, request.HeightValue, request.DimensionUomId, request.LabelCount, Normalize(request.PackingInstructions), request.Status, userId);
    }

    private async Task UpsertItemPhysicalSpecsAsync(long companyId, long itemId, ItemPhysicalSpecsUpsertRequest request, long? userId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.ItemPhysicalSpecs
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.ItemId == itemId, cancellationToken);

        if (entity is null)
        {
            DbContext.ItemPhysicalSpecs.Add(ItemPhysicalSpecs.Create(companyId, itemId, request.LengthValue, request.WidthValue, request.HeightValue, request.ThicknessValue, request.DimensionUomId, Normalize(request.Grade), Normalize(request.Material), Normalize(request.ColorFinish), request.ShelfLifeDays, Normalize(request.StorageCondition), Normalize(request.ToleranceNote), request.Status, userId));
            return;
        }

        entity.Update(request.LengthValue, request.WidthValue, request.HeightValue, request.ThicknessValue, request.DimensionUomId, Normalize(request.Grade), Normalize(request.Material), Normalize(request.ColorFinish), request.ShelfLifeDays, Normalize(request.StorageCondition), Normalize(request.ToleranceNote), request.Status, userId);
    }

    private async Task UpsertItemManufacturingPolicyAsync(long companyId, long itemId, ItemManufacturingPolicyUpsertRequest request, long? userId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.ItemManufacturingPolicies
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.ItemId == itemId, cancellationToken);

        if (entity is null)
        {
            DbContext.ItemManufacturingPolicies.Add(ItemManufacturingPolicy.Create(companyId, itemId, request.BomPolicy, request.RoutingPolicy, request.IssueMethod, request.ScrapAllowancePercent, Normalize(request.OperationLinkage), request.Status, userId));
            return;
        }

        entity.Update(request.BomPolicy, request.RoutingPolicy, request.IssueMethod, request.ScrapAllowancePercent, Normalize(request.OperationLinkage), request.Status, userId);
    }

    private async Task UpsertItemPlanningPolicyAsync(long companyId, long itemId, ItemPlanningPolicyUpsertRequest request, long? userId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.ItemPlanningPolicies
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.ItemId == itemId, cancellationToken);

        if (entity is null)
        {
            DbContext.ItemPlanningPolicies.Add(ItemPlanningPolicy.Create(companyId, itemId, request.MrpEnabled, request.SafetyStockQty, request.ReorderPointQty, request.MinimumQty, request.MaximumQty, request.LeadTimeDays, request.LotSizeQty, Normalize(request.AbcClass), request.Status, userId));
            return;
        }

        entity.Update(request.MrpEnabled, request.SafetyStockQty, request.ReorderPointQty, request.MinimumQty, request.MaximumQty, request.LeadTimeDays, request.LotSizeQty, Normalize(request.AbcClass), request.Status, userId);
    }

    private async Task UpsertItemInventoryPolicyAsync(long companyId, long itemId, ItemInventoryPolicyUpsertRequest request, long? userId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.ItemInventoryPolicies
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.ItemId == itemId, cancellationToken);

        if (entity is null)
        {
            DbContext.ItemInventoryPolicies.Add(ItemInventoryPolicy.Create(companyId, itemId, request.DefaultWarehouseId, request.DefaultBinId, request.SerialTrackingMode, request.LotTrackingMode, request.IsCatchWeightItem, request.NegativeStockPolicy, Normalize(request.ExpiryPolicy), request.ShelfLifeDays, request.Status, userId));
            return;
        }

        entity.Update(request.DefaultWarehouseId, request.DefaultBinId, request.SerialTrackingMode, request.LotTrackingMode, request.IsCatchWeightItem, request.NegativeStockPolicy, Normalize(request.ExpiryPolicy), request.ShelfLifeDays, request.Status, userId);
    }

    private async Task UpsertItemQualityPolicyAsync(long companyId, long itemId, ItemQualityPolicyUpsertRequest request, long? userId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var entity = await DbContext.ItemQualityPolicies
            .ApplyCompanyScope(scope)
            .FirstOrDefaultAsync(record => record.ItemId == itemId, cancellationToken);

        if (entity is null)
        {
            DbContext.ItemQualityPolicies.Add(ItemQualityPolicy.Create(companyId, itemId, request.QcRequired, request.InspectionPlanId, Normalize(request.InspectionPlanCode), Normalize(request.CertificateRequirement), Normalize(request.HoldRule), Normalize(request.TraceabilityDepth), request.Status, userId));
            return;
        }

        entity.Update(request.QcRequired, request.InspectionPlanId, Normalize(request.InspectionPlanCode), Normalize(request.CertificateRequirement), Normalize(request.HoldRule), Normalize(request.TraceabilityDepth), request.Status, userId);
    }

    private async Task ReplaceItemCustomerReferencesAsync(long companyId, long itemId, IReadOnlyCollection<ItemCustomerReferenceUpsertRequest> requests, long? userId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var existing = await DbContext.ItemCustomerReferences
            .ApplyCompanyScope(scope)
            .Where(entity => entity.ItemId == itemId)
            .ToArrayAsync(cancellationToken);

        DbContext.ItemCustomerReferences.RemoveRange(existing);

        foreach (var request in requests.Where(entry => !string.IsNullOrWhiteSpace(entry.CustomerItemCode)))
        {
            DbContext.ItemCustomerReferences.Add(ItemCustomerReference.Create(companyId, itemId, request.CustomerId, request.CustomerItemCode, Normalize(request.DrawingNo), Normalize(request.RevisionCode), Normalize(request.PackagingOverride), Normalize(request.SpecificationOverride), request.ApprovalStatus, request.EffectiveFrom, request.EffectiveTo, request.Status, userId));
        }
    }

    private async Task ReplaceItemVendorReferencesAsync(long companyId, long itemId, IReadOnlyCollection<ItemVendorReferenceUpsertRequest> requests, long? userId, CancellationToken cancellationToken)
    {
        var scope = GetScope();
        var existing = await DbContext.ItemVendorReferences
            .ApplyCompanyScope(scope)
            .Where(entity => entity.ItemId == itemId)
            .ToArrayAsync(cancellationToken);

        DbContext.ItemVendorReferences.RemoveRange(existing);

        foreach (var request in requests.Where(entry => !string.IsNullOrWhiteSpace(entry.VendorItemCode)))
        {
            DbContext.ItemVendorReferences.Add(ItemVendorReference.Create(companyId, itemId, request.SupplierId, request.VendorItemCode, request.MinimumOrderQty, request.LeadTimeDays, request.PurchaseUomId, Normalize(request.ComplianceStatus), Normalize(request.DocumentStatus), request.EffectiveFrom, request.EffectiveTo, request.Status, userId));
        }
    }

    private static IQueryable<UomClass> ApplyUomClassFilters(IQueryable<UomClass> query, MeasurementFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ClassCode.Contains(search) || entity.ClassName.Contains(search));
        }

        return query;
    }

    private static IQueryable<Uom> ApplyUomFilters(IQueryable<Uom> query, MeasurementFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.UomCode.Contains(search) || entity.UomName.Contains(search) || (entity.Symbol != null && entity.Symbol.Contains(search)));
        }

        return query;
    }

    private static IQueryable<UomConversion> ApplyUomConversionFilters(IQueryable<UomConversion> query, MeasurementFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity =>
                entity.ConversionMode.Contains(search) ||
                entity.RoundMode.Contains(search) ||
                (entity.FormulaTokenSet != null && entity.FormulaTokenSet.Contains(search)));
        }

        return query;
    }

    private static IQueryable<MeasurementProfile> ApplyMeasurementProfileFilters(IQueryable<MeasurementProfile> query, MeasurementFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.ProfileCode.Contains(search) || entity.ProfileName.Contains(search) || entity.ProfileType.Contains(search));
        }

        return query;
    }

    private static IQueryable<MeasurementFormula> ApplyMeasurementFormulaFilters(IQueryable<MeasurementFormula> query, MeasurementFilter filter)
    {
        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.MeasurementProfileId == filter.CompanyId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.FormulaCode.Contains(search) || entity.FormulaName.Contains(search) || entity.FormulaPurpose.Contains(search));
        }

        return query;
    }

    private static IQueryable<Item> ApplyItemFilters(IQueryable<Item> query, CompanyScopedFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity =>
                entity.ItemCode.Contains(search) ||
                entity.ItemName.Contains(search) ||
                (entity.ShortName != null && entity.ShortName.Contains(search)) ||
                entity.ItemType.Contains(search));
        }

        return query;
    }

    private static IQueryable<ItemVariant> ApplyItemVariantFilters(IQueryable<ItemVariant> query, CompanyScopedFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity =>
                entity.VariantCode.Contains(search) ||
                entity.VariantName.Contains(search) ||
                entity.VariantKey.Contains(search) ||
                (entity.VariantAttributeSummary != null && entity.VariantAttributeSummary.Contains(search)));
        }

        return query;
    }

    private static IQueryable<ItemUom> ApplyItemUomFilters(IQueryable<ItemUom> query, CompanyScopedFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search) && long.TryParse(filter.Search.Trim(), out var itemId))
        {
            query = query.Where(entity => entity.ItemId == itemId);
        }

        return query;
    }

    private static IQueryable<ItemBarcode> ApplyItemBarcodeFilters(IQueryable<ItemBarcode> query, CompanyScopedFilter filter)
    {
        if (!string.IsNullOrWhiteSpace(filter.Status))
        {
            var status = filter.Status.Trim();
            query = query.Where(entity => entity.Status == status);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity => entity.BarcodeValue.Contains(search) || entity.ScanPurpose.Contains(search) || entity.BarcodeType.Contains(search));
        }

        return query;
    }

    private static void ValidateUomClass(UomClassUpsertRequest request) =>
        ThrowIfInvalid(
            Required(request.ClassCode, nameof(request.ClassCode), "Class code is required."),
            Required(request.ClassName, nameof(request.ClassName), "Class name is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateUom(UomUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.UomClassId, nameof(request.UomClassId), "UOM class is required."),
            Required(request.UomCode, nameof(request.UomCode), "UOM code is required."),
            Required(request.UomName, nameof(request.UomName), "UOM name is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.DecimalPrecision, nameof(request.DecimalPrecision), "Decimal precision cannot be negative."));

    private static void ValidateUomConversion(UomConversionUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.FromUomId, nameof(request.FromUomId), "From UOM is required."),
            Positive(request.ToUomId, nameof(request.ToUomId), "To UOM is required."),
            Positive(request.FactorNumerator, nameof(request.FactorNumerator), "Factor numerator must be greater than zero."),
            Positive(request.FactorDenominator, nameof(request.FactorDenominator), "Factor denominator must be greater than zero."),
            Required(request.ConversionMode, nameof(request.ConversionMode), "Conversion mode is required."),
            Required(request.RoundMode, nameof(request.RoundMode), "Round mode is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.PrecisionScale, nameof(request.PrecisionScale), "Precision scale cannot be negative."));

    private static void ValidateMeasurementProfile(MeasurementProfileUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.StockUomClassId, nameof(request.StockUomClassId), "Stock UOM class is required."),
            Required(request.ProfileCode, nameof(request.ProfileCode), "Profile code is required."),
            Required(request.ProfileName, nameof(request.ProfileName), "Profile name is required."),
            Required(request.ProfileType, nameof(request.ProfileType), "Profile type is required."),
            Required(request.Status, nameof(request.Status), "Status is required."));

    private static void ValidateMeasurementFormula(MeasurementFormulaUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.MeasurementProfileId, nameof(request.MeasurementProfileId), "Measurement profile is required."),
            Positive(request.OutputUomId, nameof(request.OutputUomId), "Output UOM is required."),
            Required(request.FormulaCode, nameof(request.FormulaCode), "Formula code is required."),
            Required(request.FormulaName, nameof(request.FormulaName), "Formula name is required."),
            Required(request.FormulaPurpose, nameof(request.FormulaPurpose), "Formula purpose is required."),
            Required(request.ExpressionTemplate, nameof(request.ExpressionTemplate), "Formula expression is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.PrecisionScale, nameof(request.PrecisionScale), "Precision scale cannot be negative."));

    private static void ValidateItemMasterProfile(ItemMasterProfileUpsertRequest request)
    {
        var errors = new List<ApiError?>
        {
            Required(request.Catalog.CatalogTitle, nameof(request.Catalog.CatalogTitle), "Catalog title is required."),
            Required(request.Catalog.PublishStatus, nameof(request.Catalog.PublishStatus), "Catalog publish status is required."),
            Required(request.Catalog.Status, nameof(request.Catalog.Status), "Catalog status is required."),
            Required(request.Packaging.Status, nameof(request.Packaging.Status), "Packaging status is required."),
            request.Packaging.LabelCount.HasValue && request.Packaging.LabelCount.Value < 0
                ? new ApiError("validation.out_of_range", nameof(request.Packaging.LabelCount), "Label count cannot be negative.")
                : null,
            Required(request.PhysicalSpecs.Status, nameof(request.PhysicalSpecs.Status), "Physical specs status is required."),
            request.PhysicalSpecs.ShelfLifeDays.HasValue && request.PhysicalSpecs.ShelfLifeDays.Value < 0
                ? new ApiError("validation.out_of_range", nameof(request.PhysicalSpecs.ShelfLifeDays), "Shelf life cannot be negative.")
                : null,
            Required(request.ManufacturingPolicy.BomPolicy, nameof(request.ManufacturingPolicy.BomPolicy), "BOM policy is required."),
            Required(request.ManufacturingPolicy.RoutingPolicy, nameof(request.ManufacturingPolicy.RoutingPolicy), "Routing policy is required."),
            Required(request.ManufacturingPolicy.IssueMethod, nameof(request.ManufacturingPolicy.IssueMethod), "Issue method is required."),
            Required(request.ManufacturingPolicy.Status, nameof(request.ManufacturingPolicy.Status), "Manufacturing policy status is required."),
            NonNegative(request.ManufacturingPolicy.ScrapAllowancePercent, nameof(request.ManufacturingPolicy.ScrapAllowancePercent), "Scrap allowance cannot be negative."),
            Required(request.PlanningPolicy.Status, nameof(request.PlanningPolicy.Status), "Planning policy status is required."),
            NonNegative(request.PlanningPolicy.SafetyStockQty, nameof(request.PlanningPolicy.SafetyStockQty), "Safety stock cannot be negative."),
            NonNegative(request.PlanningPolicy.ReorderPointQty, nameof(request.PlanningPolicy.ReorderPointQty), "Reorder point cannot be negative."),
            NonNegative(request.PlanningPolicy.MinimumQty, nameof(request.PlanningPolicy.MinimumQty), "Minimum quantity cannot be negative."),
            NonNegative(request.PlanningPolicy.MaximumQty, nameof(request.PlanningPolicy.MaximumQty), "Maximum quantity cannot be negative."),
            NonNegative(request.PlanningPolicy.LotSizeQty, nameof(request.PlanningPolicy.LotSizeQty), "Lot size cannot be negative."),
            request.PlanningPolicy.LeadTimeDays.HasValue && request.PlanningPolicy.LeadTimeDays.Value < 0
                ? new ApiError("validation.out_of_range", nameof(request.PlanningPolicy.LeadTimeDays), "Planning lead time cannot be negative.")
                : null,
            Required(request.InventoryPolicy.SerialTrackingMode, nameof(request.InventoryPolicy.SerialTrackingMode), "Serial tracking mode is required."),
            Required(request.InventoryPolicy.LotTrackingMode, nameof(request.InventoryPolicy.LotTrackingMode), "Lot tracking mode is required."),
            Required(request.InventoryPolicy.NegativeStockPolicy, nameof(request.InventoryPolicy.NegativeStockPolicy), "Negative stock policy is required."),
            Required(request.InventoryPolicy.Status, nameof(request.InventoryPolicy.Status), "Inventory policy status is required."),
            request.InventoryPolicy.ShelfLifeDays.HasValue && request.InventoryPolicy.ShelfLifeDays.Value < 0
                ? new ApiError("validation.out_of_range", nameof(request.InventoryPolicy.ShelfLifeDays), "Inventory shelf life cannot be negative.")
                : null,
            Required(request.QualityPolicy.Status, nameof(request.QualityPolicy.Status), "Quality policy status is required.")
        };

        foreach (var alias in request.Aliases.Where(entry => !string.IsNullOrWhiteSpace(entry.AliasValue)))
        {
            errors.Add(Required(alias.AliasType, nameof(alias.AliasType), "Alias type is required."));
            errors.Add(Required(alias.Status, nameof(alias.Status), "Alias status is required."));
        }

        foreach (var reference in request.CustomerReferences.Where(entry => !string.IsNullOrWhiteSpace(entry.CustomerItemCode)))
        {
            errors.Add(Positive(reference.CustomerId, nameof(reference.CustomerId), "Customer is required for customer item reference."));
            errors.Add(Required(reference.ApprovalStatus, nameof(reference.ApprovalStatus), "Customer reference approval status is required."));
            errors.Add(Required(reference.Status, nameof(reference.Status), "Customer reference status is required."));
        }

        foreach (var reference in request.VendorReferences.Where(entry => !string.IsNullOrWhiteSpace(entry.VendorItemCode)))
        {
            errors.Add(Positive(reference.SupplierId, nameof(reference.SupplierId), "Supplier is required for vendor item reference."));
            errors.Add(NonNegative(reference.MinimumOrderQty, nameof(reference.MinimumOrderQty), "Vendor MOQ cannot be negative."));
            errors.Add(reference.LeadTimeDays.HasValue && reference.LeadTimeDays.Value < 0
                ? new ApiError("validation.out_of_range", nameof(reference.LeadTimeDays), "Vendor lead time cannot be negative.")
                : null);
            errors.Add(Required(reference.Status, nameof(reference.Status), "Vendor reference status is required."));
        }

        ThrowIfInvalid(errors);
    }

    private static void ValidateItem(ItemUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.ItemGroupId, nameof(request.ItemGroupId), "Item group is required."),
            Positive(request.MeasurementProfileId, nameof(request.MeasurementProfileId), "Measurement profile is required."),
            Positive(request.StockUomId, nameof(request.StockUomId), "Stock UOM is required."),
            Required(request.ItemCode, nameof(request.ItemCode), "Item code is required."),
            Required(request.ItemName, nameof(request.ItemName), "Item name is required."),
            Required(request.ItemType, nameof(request.ItemType), "Item type is required."),
            Required(request.TraceabilityMode, nameof(request.TraceabilityMode), "Traceability mode is required."),
            Required(request.DefaultIssueMethod, nameof(request.DefaultIssueMethod), "Issue method is required."),
            Required(request.DefaultMakeType, nameof(request.DefaultMakeType), "Make type is required."),
            Required(request.ReorderPolicy, nameof(request.ReorderPolicy), "Reorder policy is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.LeadTimeDays, nameof(request.LeadTimeDays), "Lead time cannot be negative."));

    private static void ValidateItemVariant(ItemVariantUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.ItemId, nameof(request.ItemId), "Parent item is required."),
            Required(request.VariantCode, nameof(request.VariantCode), "Variant code is required."),
            Required(request.VariantName, nameof(request.VariantName), "Variant name is required."),
            Required(request.VariantKey, nameof(request.VariantKey), "Variant key is required."),
            Required(request.VariantAttributeMapJson, nameof(request.VariantAttributeMapJson), "Attribute map is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.OverrideWeightPerUnit, nameof(request.OverrideWeightPerUnit), "Override weight cannot be negative."));

    private static void ValidateItemUom(ItemUomUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.ItemId, nameof(request.ItemId), "Parent item is required."),
            Positive(request.UomId, nameof(request.UomId), "UOM is required."),
            Positive(request.BaseToThisNumerator, nameof(request.BaseToThisNumerator), "Base numerator must be greater than zero."),
            Positive(request.BaseToThisDenominator, nameof(request.BaseToThisDenominator), "Base denominator must be greater than zero."),
            Required(request.UomRole, nameof(request.UomRole), "UOM role is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.MinOrderQty, nameof(request.MinOrderQty), "Minimum order quantity cannot be negative."),
            NonNegative(request.RoundingScale, nameof(request.RoundingScale), "Rounding scale cannot be negative."));

    private static void ValidateItemBarcode(ItemBarcodeUpsertRequest request) =>
        ThrowIfInvalid(
            Positive(request.CompanyId, nameof(request.CompanyId), "Company is required."),
            Positive(request.ItemId, nameof(request.ItemId), "Parent item is required."),
            Required(request.BarcodeValue, nameof(request.BarcodeValue), "Barcode value is required."),
            Required(request.BarcodeType, nameof(request.BarcodeType), "Barcode type is required."),
            Required(request.ScanPurpose, nameof(request.ScanPurpose), "Scan purpose is required."),
            Required(request.Status, nameof(request.Status), "Status is required."),
            NonNegative(request.PreferenceRank, nameof(request.PreferenceRank), "Preference rank cannot be negative."));

    private static UomClassDto MapUomClass(UomClass entity) =>
        new(entity.Id, entity.ClassCode, entity.ClassName, entity.BaseUomId, entity.SupportsFormulaConversion, entity.Status);

    private static UomDto MapUom(Uom entity) =>
        new(entity.Id, entity.UomCode, entity.UomName, entity.Symbol, entity.UomClassId, entity.DecimalPrecision, entity.IsSystemBase, entity.Status);

    private static UomConversionDto MapUomConversion(UomConversion entity) =>
        new(entity.Id, entity.FromUomId, entity.ToUomId, entity.ConversionMode, entity.FactorNumerator, entity.FactorDenominator, entity.FormulaTokenSet, entity.RoundMode, entity.PrecisionScale, entity.Status);

    private static MeasurementProfileDto MapMeasurementProfile(MeasurementProfile entity) =>
        new(
            entity.Id,
            entity.ProfileCode,
            entity.ProfileName,
            entity.ProfileType,
            entity.StockUomClassId,
            entity.AllowsCatchWeight,
            entity.RequiresDimensions,
            entity.RequiresDensity,
            entity.RequiresThickness,
            entity.RequiresPackSize,
            entity.SupportsCommercialProductionSplit,
            entity.Status);

    private static MeasurementFormulaDto MapMeasurementFormula(MeasurementFormula entity) =>
        new(entity.Id, entity.MeasurementProfileId, entity.FormulaCode, entity.FormulaName, entity.FormulaPurpose, entity.ExpressionTemplate, entity.OutputUomId, entity.PrecisionScale, entity.Status);

    private static ItemDto MapItem(Item entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemCode,
            entity.ItemName,
            entity.ShortName,
            entity.ItemType,
            entity.ItemGroupId,
            entity.MeasurementProfileId,
            entity.StockUomId,
            entity.PurchaseUomId,
            entity.SalesUomId,
            entity.ProductionUomId,
            entity.QcUomId,
            entity.TraceabilityMode,
            entity.IsCatchWeightItem,
            entity.IsQcRequired,
            entity.IsBatchExpiryTracked,
            entity.DefaultIssueMethod,
            entity.DefaultMakeType,
            entity.DefaultWarehouseId,
            entity.DefaultBinId,
            entity.LeadTimeDays,
            entity.ReorderPolicy,
            entity.Status);

    private static ItemVariantDto MapItemVariant(ItemVariant entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.VariantCode,
            entity.VariantName,
            entity.VariantKey,
            entity.VariantAttributeSummary,
            entity.VariantAttributeMapJson,
            entity.OverrideMeasurementProfileId,
            entity.OverrideStockUomId,
            entity.OverrideWeightPerUnit,
            entity.Status);

    private static ItemUomDto MapItemUom(ItemUom entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.ItemVariantId,
            entity.UomRole,
            entity.UomId,
            entity.BaseToThisNumerator,
            entity.BaseToThisDenominator,
            entity.MeasurementFormulaId,
            entity.IsDefault,
            entity.IsCatchWeightActualUom,
            entity.MinOrderQty,
            entity.RoundingScale,
            entity.Status);

    private static ItemBarcodeDto MapItemBarcode(ItemBarcode entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.ItemVariantId,
            entity.UomId,
            entity.BarcodeValue,
            entity.BarcodeType,
            entity.ScanPurpose,
            entity.PreferenceRank,
            entity.IsPrimary,
            entity.Status);

    private static ItemAliasDto MapItemAlias(ItemAlias entity) =>
        new(entity.Id, entity.CompanyId ?? 0, entity.ItemId, entity.AliasType, entity.AliasValue, entity.LanguageCode, entity.IsPrimary, entity.Status);

    private static ItemMediaDto MapItemMedia(ItemMedia entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.ItemVariantId,
            entity.MediaType,
            entity.Title,
            entity.FileName,
            entity.MimeType,
            entity.StorageUri,
            entity.ThumbnailUri,
            entity.IsPrimary,
            entity.SortOrder,
            entity.ApprovalStatus,
            entity.VisibilityScope,
            entity.RetiredOnUtc,
            entity.Status);

    private static ItemDocumentDto MapItemDocument(ItemDocument entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.ItemVariantId,
            entity.DocumentType,
            entity.Title,
            entity.DocumentNo,
            entity.RevisionCode,
            entity.FileName,
            entity.StorageUri,
            entity.ApprovalStatus,
            entity.VisibilityScope,
            entity.EffectiveFrom,
            entity.EffectiveTo,
            entity.ExpiresOn,
            entity.Status);

    private static ItemCatalogDto MapItemCatalog(ItemCatalog entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.CatalogTitle,
            entity.CatalogSection,
            entity.MarketingDescription,
            entity.CustomerVisibleSpecsJson,
            entity.PublishStatus,
            entity.IsCatalogVisible,
            entity.EffectiveFrom,
            entity.EffectiveTo,
            entity.PreviewSlug,
            entity.Status);

    private static ItemPackagingDto MapItemPackaging(ItemPackaging entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.PackagingUomId,
            entity.InnerPackQty,
            entity.CartonQty,
            entity.PalletQty,
            entity.NetWeight,
            entity.GrossWeight,
            entity.WeightUomId,
            entity.LengthValue,
            entity.WidthValue,
            entity.HeightValue,
            entity.DimensionUomId,
            entity.LabelCount,
            entity.PackingInstructions,
            entity.Status);

    private static ItemPhysicalSpecsDto MapItemPhysicalSpecs(ItemPhysicalSpecs entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.LengthValue,
            entity.WidthValue,
            entity.HeightValue,
            entity.ThicknessValue,
            entity.DimensionUomId,
            entity.Grade,
            entity.Material,
            entity.ColorFinish,
            entity.ShelfLifeDays,
            entity.StorageCondition,
            entity.ToleranceNote,
            entity.Status);

    private static ItemCustomerReferenceDto MapItemCustomerReference(ItemCustomerReference entity, IReadOnlyDictionary<long, Customer> customers)
    {
        customers.TryGetValue(entity.CustomerId, out var customer);
        return new ItemCustomerReferenceDto(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.CustomerId,
            customer?.CustomerCode,
            customer?.CustomerName,
            entity.CustomerItemCode,
            entity.DrawingNo,
            entity.RevisionCode,
            entity.PackagingOverride,
            entity.SpecificationOverride,
            entity.ApprovalStatus,
            entity.EffectiveFrom,
            entity.EffectiveTo,
            entity.Status);
    }

    private static ItemVendorReferenceDto MapItemVendorReference(ItemVendorReference entity, IReadOnlyDictionary<long, Supplier> suppliers)
    {
        suppliers.TryGetValue(entity.SupplierId, out var supplier);
        return new ItemVendorReferenceDto(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.SupplierId,
            supplier?.SupplierCode,
            supplier?.SupplierName,
            entity.VendorItemCode,
            entity.MinimumOrderQty,
            entity.LeadTimeDays,
            entity.PurchaseUomId,
            entity.ComplianceStatus,
            entity.DocumentStatus,
            entity.EffectiveFrom,
            entity.EffectiveTo,
            entity.Status);
    }

    private static ItemManufacturingPolicyDto MapItemManufacturingPolicy(ItemManufacturingPolicy entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.BomPolicy,
            entity.RoutingPolicy,
            entity.IssueMethod,
            entity.ScrapAllowancePercent,
            entity.OperationLinkage,
            entity.Status);

    private static ItemPlanningPolicyDto MapItemPlanningPolicy(ItemPlanningPolicy entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.MrpEnabled,
            entity.SafetyStockQty,
            entity.ReorderPointQty,
            entity.MinimumQty,
            entity.MaximumQty,
            entity.LeadTimeDays,
            entity.LotSizeQty,
            entity.AbcClass,
            entity.Status);

    private static ItemInventoryPolicyDto MapItemInventoryPolicy(ItemInventoryPolicy entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.DefaultWarehouseId,
            entity.DefaultBinId,
            entity.SerialTrackingMode,
            entity.LotTrackingMode,
            entity.IsCatchWeightItem,
            entity.NegativeStockPolicy,
            entity.ExpiryPolicy,
            entity.ShelfLifeDays,
            entity.Status);

    private static ItemQualityPolicyDto MapItemQualityPolicy(ItemQualityPolicy entity) =>
        new(
            entity.Id,
            entity.CompanyId ?? 0,
            entity.ItemId,
            entity.QcRequired,
            entity.InspectionPlanId,
            entity.InspectionPlanCode,
            entity.CertificateRequirement,
            entity.HoldRule,
            entity.TraceabilityDepth,
            entity.Status);
}
