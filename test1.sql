-- look at ridership from midnight to 12:30 for each day

SELECT date_trunc('day', startdate), sum(transactions)
FROM latenight
WHERE -- startdate < date '2014-03-28' AND
    extract(hour from startdate) = 0
AND extract(minute from startdate) < 30
GROUP BY date_trunc('day', startdate)
ORDER BY date_trunc('day', startdate);;
