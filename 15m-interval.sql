CREATE OR REPLACE VIEW intervals_15m AS
SELECT servicedate,startdate,(startdate::time) AS starttime, sum(transactions) AS transactions FROM latenight GROUP BY servicedate,startdate ORDER BY startdate;

-- year to year comparison of transactions at 15 minute intervals

SELECT a.servicedate AS date2013,b.servicedate AS date2014,b.startdate,b.starttime,a.transactions AS transactions2013,b.transactions AS transactions2014
FROM intervals_15m AS a JOIN intervals_15m AS b USING (starttime)
JOIN yty AS y ON (a.servicedate = y.date2013 AND y.date2014 = b.servicedate)
ORDER BY b.startdate
;
