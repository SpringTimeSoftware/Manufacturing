:setvar ConfirmDemoReset "NO"

IF '$(ConfirmDemoReset)' <> 'YES'
BEGIN
    THROW 51000, 'Demo reset is guarded. Re-run with -v ConfirmDemoReset=YES after confirming this is not production data.', 1;
END;

SET XACT_ABORT ON;
BEGIN TRANSACTION;

-- Guarded UAT reset hook. Keep deletes narrow and demo-code scoped as concrete demo
-- records are promoted into executable seed scripts.
DELETE FROM platform.Notifications
WHERE RelatedDocumentType IN ('UAT-DEMO', 'DailyOperationsDigest');

DELETE FROM ai.AiRuns
WHERE RelatedDocumentType IN ('UAT-DEMO', 'DailyOperationsDigest');

DELETE FROM integration.ImportJobs
WHERE JobNo LIKE 'UAT-%';

DELETE FROM integration.ExportJobs
WHERE JobNo LIKE 'UAT-%';

COMMIT TRANSACTION;
