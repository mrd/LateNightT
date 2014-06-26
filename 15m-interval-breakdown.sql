CREATE OR REPLACE VIEW intervals_15m_breakdown AS
SELECT line,routestation,servicedate,startdate,(startdate::time) AS starttime, (transactions) AS transactions FROM latenight
WHERE extract(month FROM servicedate) BETWEEN 3 AND 6
-- GROUP BY routestation,servicedate,startdate
ORDER BY routestation,startdate;

-- SELECT * FROM intervals_15m_breakdown;

-- year to year comparison of transactions at 15 minute intervals

-- DROP TABLE yty_intervals_15m_breakdown;
-- CREATE TABLE yty_intervals_15m_breakdown AS (
-- 
-- SELECT a.servicedate AS date2013,b.servicedate AS date2014,b.startdate,b.starttime,line,routestation,a.transactions AS transactions2013,b.transactions AS transactions2014
-- FROM intervals_15m_breakdown AS a JOIN intervals_15m_breakdown AS b USING (starttime,line,routestation)
-- JOIN yty AS y ON (a.servicedate = y.date2013 AND y.date2014 = b.servicedate)
-- ORDER BY routestation,b.startdate
-- 
-- );

DROP TABLE yty_intervals_15m_breakdown;
CREATE TABLE yty_intervals_15m_breakdown AS (

SELECT y.date2013 AS date2013,y.date2014 AS date2014,y14.startdate,y14.starttime,y14.line,y14.routestation,coalesce(y13.transactions,0) AS transactions2013,y14.transactions AS transactions2014
FROM yty AS y JOIN intervals_15m_breakdown AS y14 ON y14.servicedate = y.date2014
LEFT JOIN LATERAL (SELECT * FROM intervals_15m_breakdown WHERE servicedate = y.date2013 AND line = y14.line AND routestation = y14.routestation) AS y13 ON y13.starttime = y14.starttime
ORDER BY y14.routestation,y14.startdate

);
