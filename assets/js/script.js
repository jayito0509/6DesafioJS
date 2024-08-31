    document.getElementById('convertir').addEventListener('click', async function() {
        const montoCLP = parseFloat(document.getElementById('monto').value);
        const moneda = document.getElementById('moneda').value;
        const resultadoElement = document.getElementById('resultado');
        const ctx = document.getElementById('graficoHistorial').getContext('2d');
        const precioMoneda = document.getElementById('montoConvertido');
      
        if (isNaN(montoCLP) || montoCLP <= 0) {
          resultadoElement.textContent = 'Por favor, ingrese un monto válido en pesos chilenos.';
          return;
        }
      
        try {
          // Obtener el tipo de cambio actual
          const respuesta = await fetch(`https://mindicador.cl/api/${moneda}`);
          if (!respuesta.ok) {
            throw new Error('Error en la solicitud: ' + respuesta.statusText);
          }
          const datos = await respuesta.json();
          const tipoCambioActual = datos.serie[0].valor;
      
          // Calcular la conversión
          const montoConvertido = montoCLP / tipoCambioActual;
          resultadoElement.textContent = `Monto convertido a ${moneda.toUpperCase()}: ${montoConvertido.toFixed(2)}`;
      
          // Obtener el historial de los últimos 10 días
          const respuestaHistorial = await fetch(`https://mindicador.cl/api/${moneda}`);
          if (!respuestaHistorial.ok) {
            throw new Error('Error en la solicitud de historial: ' + respuestaHistorial.statusText);
          }
          const datosHistorial = await respuestaHistorial.json();
          
          // Filtrar los datos de los últimos 10 días
          const hoy = new Date();
          const fechas = [];
          const valores = [];
          
          for (let i = 0; i < datosHistorial.serie.length && i < 10; i++) {
            const item = datosHistorial.serie[i];
            const fecha = new Date(item.fecha);
            const valor = item.valor;
            
            if (fecha <= hoy) {
              fechas.push(fecha.toLocaleDateString());
              valores.push(valor);
            }
          }
      
          // Crear el gráfico usando Chart.js
          new Chart(ctx, 
            {
            type: 'line',
            data: {
              labels: fechas.reverse(),
              datasets: [{
                label: `Valor del ${moneda.toUpperCase()} en los últimos 10 días`,
                data: valores.reverse(),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                x: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Fecha'
                  }
                },
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Valor'
                  }
                }
              }
            }
          });
      
        } catch (error) {
          resultadoElement.textContent = 'Ocurrió un error al obtener los datos.';
          console.error('Error:', error);
        }
      });
      
    