-- look at busiest post-midnight stations and routes since 2014-03-28

SELECT routestation, round(avg(transactions)) AS avgtx
FROM (SELECT routestation,servicedate,sum(transactions) AS transactions
      FROM latenight
      WHERE latenightroute = 1
      AND servicedate >= date '2014-03-28'
      AND extract(hour from starttime) < 5
      GROUP BY routestation,servicedate) AS q
GROUP BY routestation
ORDER BY avgtx DESC;
