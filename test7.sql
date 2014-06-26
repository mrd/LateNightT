-- compare May 2013 to May 2014 

SELECT sum(transactions) AS transactions FROM latenight
WHERE extract(year from servicedate) = 2013 AND extract(month from servicedate) = 5;

SELECT sum(transactions) AS transactions FROM latenight
WHERE extract(year from servicedate) = 2014 AND extract(month from servicedate) = 5;

