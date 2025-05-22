
function fetchDashboardData() {
    fetch('/api/dashboard-stats')
        .then(response => response.json())
        .then(data => {
            console.log('Dữ liệu từ API:', data); // Kiểm tra dữ liệu API
            console.log('recipeStatistics:', data.recipeStatistics); // Kiểm tra recipeStatistics

            document.getElementById('total-customers').textContent = data.totalCustomers;
            document.getElementById('total-recipes').textContent = data.totalRecipes;
            document.getElementById('monthly-customers').textContent = data.monthlyNewCustomers;
            document.getElementById('monthly-recipes').textContent = data.monthlyNewRecipes;

// cate table
const fixedCategories = [
    { category: 'Main Dish', icon: '🍲' },
    { category: 'Appetizer', icon: '🥟' },
    { category: 'Dessert', icon: '🍰' },
    { category: 'Beverage', icon: '🥤' },
    { category: 'Vegetarian', icon: '🥗' },
    { category: 'Snack', icon: '🍟' }
];

if (Array.isArray(data.recipeStatistics)) {
    const tableRows = fixedCategories.map(({ category, icon }, index) => {
        const count = data.recipeStatistics[index] || 0;
        return `
            <tr>
                <td style="padding: 15px;">${icon} ${category}</td>
                <td style="padding: 15px;">${count}</td>
            </tr>
        `;
    }).join('');

    const tableHTML = `
        <table border="1" style="border-collapse: collapse; width: 80%; font-size: 18px; text-align: left;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 15px;">Category</th>
                    <th style="padding: 15px;">Quantity</th>
                </tr>
            </thead>
            <tbody>
                ${tableRows}
            </tbody>
        </table>
    `;

    document.getElementById('recipeTable').innerHTML = tableHTML;
}

// end table 


const ageData = {
    labels: ['Under 18', '18-25', '25-50', 'Over 50'],
    datasets: [{
        label: 'Age Distribution',
        data: data.ageDistribution,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
        borderRadius: 10,
        borderSkipped: false,
        barThickness: 60  
    }]
};

const config = {
    type: 'bar',
    data: ageData,
    options: {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: 'User Age Distribution',
                font: {
                    size: 18
                },
                padding: {
                    top: 10,
                    bottom: 20
                }
            },
            legend: {
                display: false
            },
            tooltip: {
                backgroundColor: '#222',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#999',
                borderWidth: 1
            }
        },
        scales: {
            x: {
               
                ticks: {
                    font: {
                        size: 14
                    }
                },
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Users',
                    font: {
                        size: 14
                    }
                },
                grid: {
                    display: false // ❌ Tắt lưới trục Y
                },
                ticks: {
                    stepSize: 1
                }
            }
        }
    }
};
          const genderData = {
    labels: ['Female ', 'Male ', 'Other '],
    datasets: [{
        label: 'Gender distribution of users from CookHub ',
        data: data.genderDistribution,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
        borderColor: '#FFFFFF',
        borderWidth: 1
    }]
};

// Cấu hình biểu đồ với kích thước cố định
new Chart(document.getElementById('gender-distribution-chart').getContext('2d'), {
    type: 'pie',
    data: genderData,
    options: {
        responsive: false, // Tắt responsive để giữ kích thước cố định
        maintainAspectRatio: false, // Cho phép điều chỉnh kích thước tự do
        plugins: {
            title: {
                display: true,
                text: 'Gender Distribution of users from Cookhub ',
                font: { size: 16 }
            },
            legend: {
                position: 'top',
                labels: { font: { size: 12 } }
            }
        },
        layout: {
            padding: 5 // Giảm khoảng cách để phù hợp với kích thước nhỏ
        }
    }
});


// Tạo bảng top chefs
const chefTableRows = data.topChefs.map((chef, index) => {
    return `
        <tr>
            <td style="padding: 12px;">${index + 1}</td>
            <td style="padding: 12px;">${chef.name}</td>
            <td style="padding: 12px;">${parseFloat(chef.rating).toFixed(2)}</td>
        </tr>
    `;
}).join('');

// HTML bảng
const chefTableHTML = `
    <table border="1" style="border-collapse: collapse; width: 80%; font-size: 18px; text-align: left; margin-top: 20px;">
        <thead>
            <tr style="background-color: #f2f2f2;">
                <th style="padding: 12px;">Ranking</th>
                <th style="padding: 12px;">Chef name </th>
                <th style="padding: 12px;">Ratings </th>
            </tr>
        </thead>
        <tbody>
            ${chefTableRows}
        </tbody>
    </table>
`;

// Chèn bảng vào DOM
document.getElementById('topChefsTable').innerHTML = chefTableHTML;

            


            // Initialize charts (assuming Chart.js is included)
            new Chart(document.getElementById('age-distribution-chart').getContext('2d'), {
                type: 'bar',
                data: ageData,
                options: { scales: { y: { beginAtZero: true } } }
            });
            new Chart(document.getElementById('gender-distribution-chart').getContext('2d'), {
                type: 'pie',
                data: genderData
            });
            
            
        })
        .catch(error => console.error('Error fetching dashboard data:', error));
}

document.addEventListener('DOMContentLoaded', fetchDashboardData);