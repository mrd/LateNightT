DROP TABLE latenight;
CREATE TABLE latenight AS (

SELECT scheduledate + trxhour * interval '1 hour' + trx15min * interval '15 minutes' AS startdate,
       (scheduledate + trxhour * interval '1 hour' + trx15min * interval '15 minutes')::time AS starttime,
       scheduledate::date AS servicedate,
       latenightroute, line, routestation, trxdow, transactions
FROM latenight_raw

);

CREATE INDEX latenight_servicedate ON latenight (servicedate);
CREATE INDEX latenight_starttime ON latenight (starttime);
CREATE INDEX latenight_routestation ON latenight (routestation);
