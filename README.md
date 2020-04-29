# API de la División Político Administrativa de Chile con polígonos y centros

Este proyecto es una recreación de la [API de la División Politico Administrativa de Chile](https://apis.digital.gob.cl/dpa/#) creada por la Unidad de Modernización y Gobierno Digital con la diferencia que esta API permite **devolver los polígonos** de cada división administrativa (regiones, provincias y comunas).

## Documentación

### Regiones

#### `GET /v1/regiones`

Devuelve un arreglo de todas las regiones.

#### `GET /v1/regiones/:codigoRegion`

Devuelve un objeto de la región seleccionada.

##### Parámetros

| Parámetro | Tipo | Descripción |
|--------|-----|-------------|
| `codigoRegion`  | `String` | Códígo de la región asignado por la DPA y entregado por esta API |

### Provincias

#### `GET /v1/provincias`

Devuelve un arreglo de todas las provincias.

#### `GET /v1/provincias/:codigoProvincia`

Devuelve un objeto de la provincia seleccionada.

##### Parámetros

| Parámetro | Tipo | Descripción |
|--------|-----|-------------|
| `codigoProvincia`  | `String` | Códígo de la provincia asignado por la DPA y entregado por esta API |

#### `GET /v1/regiones/:codigoRegion/provincias`

Devuelve un arreglo de todas las provincias pertenecientes a una región.

##### Parámetros

| Parámetro | Tipo | Descripción |
|--------|-----|-------------|
| `codigoRegion`  | `String` | Códígo de la región padre asignado por la DPA y entregado por esta API  |

#### `GET /v1/regiones/:codigoRegion/provincias/:codigoProvincia`

Devuelve un objeto de la provincia seleccionada perteneciente a una región.

##### Parámetros

| Parámetro | Tipo | Descripción |
|--------|-----|-------------|
| `codigoRegion`  | `String` | Códígo de la region padre asignado por la DPA y entregado por esta API  |
| `codigoProvincia`  | `String` | Códígo de la provincia asignado por la DPA y entregado por esta API |

### Comunas

#### `GET /v1/comunas`

Devuelve un arreglo de todas las comunas.

#### `GET /v1/comunas/:codigoComuna`

Devuelve un objeto de la comuna seleccionada.

##### Parámetros

| Parámetro | Tipo | Descripción |
|--------|-----|-------------|
| `codigoComuna`  | `String` | Códígo de la comuna asignado por la DPA y entregado por esta API |

#### `GET /v1/provincias/:codigoProvincia/comunas`

Devuelve un arreglo de todas las comunas pertenecientes a una provincia.

##### Parámetros

| Parámetro | Tipo | Descripción |
|--------|-----|-------------|
| `codigoProvincia`  | `String` | Códígo de la provincia padre asignado por la DPA y entregado por esta API  |

#### `GET /v1/provincias/:codigoProvincia/comunas/:codigoComuna`

Devuelve un objeto de la comuna seleccionada perteneciente a una provincia.

##### Parámetros

| Parámetro | Tipo | Descripción |
|--------|-----|-------------|
| `codigoProvincia`  | `String` | Códígo de la provincia padre asignado por la DPA y entregado por esta API  |
| `codigoComuna`  | `String` | Códígo de la comuna asignado por la DPA y entregado por esta API |

#### `GET /v1/regiones/:codigoRegion/provincias/:codigoProvincia/comunas`

Devuelve un arreglo de todas las comunas pertenecientes a una provincia que a su vez pertenecen a una región.

##### Parámetros

| Parámetro | Tipo | Descripción |
|--------|-----|-------------|
| `codigoRegion`  | `String` | Códígo de la región padre asignado por la DPA y entregado por esta API  |
| `codigoProvincia`  | `String` | Códígo de la provincia padre asignado por la DPA y entregado por esta API  |

#### `GET /v1/regiones/:codigoRegion/provincias/:codigoProvincia/comunas/:codigoComuna`

Devuelve un objeto de la comuna seleccionada perteneciente a una provincia que a su vez pertence a una región.

##### Parámetros

| Parámetro | Tipo | Descripción |
|--------|-----|-------------|
| `codigoRegion`  | `String` | Códígo de la región padre asignado por la DPA y entregado por esta API  |
| `codigoProvincia`  | `String` | Códígo de la provincia padre asignado por la DPA y entregado por esta API  |
| `codigoComuna`  | `String` | Códígo de la comuna asignado por la DPA y entregado por esta API |

### Opciones

#### Polígonos

| Parámetro | Tipo | Valor por defecto | Descripción |
|--------|-----|-------------|-------------|
| `poligonos`  | `Boolean` | `false` | Define si mostrar o no los polígonos de las divisiones |
| `tolerancia`  | `Number` | `null` | Tolerancia para la simplificación de polígonos, se recomienda `0.01` |

##### Ejemplo

`GET /v1/regiones?poligonos=true&tolerancia=0.01`

#### Centros administrativos

| Parámetro | Tipo | Valor por defecto | Descripción |
|--------|-----|-------------|-------------|
| `centro`  | `Boolean` | `true` | Define si mostrar o no los centros administrativos de las divisiones |

##### Ejemplo

`GET /v1/regiones?centro=false`

#### Límites

| Parámetro | Tipo | Valor por defecto | Descripción |
|--------|-----|-------------|-------------|
| `centro`  | `Boolean` | `false` | Define si mostrar o no los límites geográficos de las divisiones |

##### Ejemplo

`GET /v1/regiones?limites=true`

## Fuente de los datos

- [Biblioteca del Congreso Nacional de Chile](https://www.bcn.cl/siit/mapas_vectoriales)
- [OpenStreetMap](https://www.openstreetmap.org/)
- [API de la División Politico Administrativa de Chile](https://apis.digital.gob.cl/dpa/#)
