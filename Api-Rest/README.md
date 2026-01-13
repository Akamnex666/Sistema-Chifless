ejecutar el script de datos

# Desde el directorio Api-Rest
cd C:\Sistema-Chifles\Api-Rest

# Con Docker (PostgreSQL en contenedor)
$env:DB_HOST='localhost'; npm run seed

# O si PostgreSQL corre localmente
npm run seed