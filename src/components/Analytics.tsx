import React from 'react';
import { FormData, FormQuestion } from '../types/form';
import { Download, FileDown, Users, Clock, BarChart3 } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

interface AnalyticsProps {
  form: FormData;
}

export function Analytics({ form }: AnalyticsProps) {
  const formatValue = (value: any, type: string) => {
    if (!value) return '-';
    
    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'time':
        return new Date(`1970-01-01T${value}`).toLocaleTimeString([], { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      case 'file_upload':
        return (value as File).name;
      default:
        return value.toString();
    }
  };

  const downloadFile = async (file: File, filename: string) => {
    try {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Error downloading file. Please try again.');
    }
  };

  const exportToExcel = () => {
    try {
      const data = form.responses.map(response => {
        const row: Record<string, any> = {
          'Response ID': response.id,
          'Submitted At': new Date(response.submittedAt).toLocaleString(),
        };

        form.questions.forEach(question => {
          const value = response.answers[question.id];
          row[question.question] = formatValue(value, question.type);
        });

        return row;
      });

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Responses');
      XLSX.writeFile(wb, `${form.title} - Responses.xlsx`);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting to Excel. Please try again.');
    }
  };

  // Calculate response statistics
  const totalResponses = form.responses.length;
  const averageResponseTime = form.responses.length > 0
    ? form.responses.reduce((acc, response) => {
        const responseTime = new Date(response.submittedAt).getTime() - new Date(form.createdAt).getTime();
        return acc + responseTime;
      }, 0) / form.responses.length
    : 0;

  // Prepare data for response trend chart
  const responseTrend = React.useMemo(() => {
    const trend: Record<string, number> = {};
    const sortedResponses = [...form.responses].sort(
      (a, b) => new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
    );
    
    sortedResponses.forEach(response => {
      const date = new Date(response.submittedAt).toLocaleDateString();
      trend[date] = (trend[date] || 0) + 1;
    });
    
    return trend;
  }, [form.responses]);

  const responseTrendData = {
    labels: Object.keys(responseTrend),
    datasets: [
      {
        label: 'Responses per Day',
        data: Object.values(responseTrend),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Prepare data for question analysis
  const getQuestionStats = React.useCallback((question: FormQuestion) => {
    if (!['multiple_choice', 'dropdown', 'checkboxes'].includes(question.type)) {
      return null;
    }

    const stats: Record<string, number> = {};
    form.responses.forEach(response => {
      const answer = response.answers[question.id];
      if (Array.isArray(answer)) {
        answer.forEach(option => {
          stats[option] = (stats[option] || 0) + 1;
        });
      } else if (answer) {
        stats[answer as string] = (stats[answer as string] || 0) + 1;
      }
    });

    return {
      labels: Object.keys(stats),
      datasets: [
        {
          data: Object.values(stats),
          backgroundColor: [
            'rgba(59, 130, 246, 0.6)',
            'rgba(16, 185, 129, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(239, 68, 68, 0.6)',
            'rgba(139, 92, 246, 0.6)',
          ],
        },
      ],
    };
  }, [form.responses]);

  // Common chart options
  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 750,
    },
  };

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Responses</p>
              <h3 className="text-2xl font-bold text-gray-900">{totalResponses}</h3>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Avg. Response Time</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {Math.round(averageResponseTime / (1000 * 60))} min
              </h3>
            </div>
            <Clock className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Questions</p>
              <h3 className="text-2xl font-bold text-gray-900">{form.questions.length}</h3>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Response Trend Chart */}
      {form.responses.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Response Trend</h3>
          <div className="h-64">
            <Line
              data={responseTrendData}
              options={{
                ...commonChartOptions,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>
      )}

      {/* Question Analysis */}
      {form.responses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {form.questions.map(question => {
            const stats = getQuestionStats(question);
            if (!stats) return null;

            return (
              <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
                <div className="h-64">
                  <Pie
                    data={stats}
                    options={{
                      ...commonChartOptions,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true,
                          },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Response Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Response Details</h3>
          <button
            onClick={exportToExcel}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export to Excel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted At
                </th>
                {form.questions.map(question => (
                  <th 
                    key={question.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {question.question}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {form.responses.map(response => (
                <tr key={response.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(response.submittedAt).toLocaleString()}
                  </td>
                  {form.questions.map(question => (
                    <td key={question.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {question.type === 'file_upload' && response.answers[question.id] ? (
                        <button
                          onClick={() => downloadFile(
                            response.answers[question.id] as File,
                            (response.answers[question.id] as File).name
                          )}
                          className="text-blue-500 hover:text-blue-600 flex items-center gap-1"
                        >
                          <Download className="w-4 h-4" />
                          {(response.answers[question.id] as File).name}
                        </button>
                      ) : (
                        formatValue(response.answers[question.id], question.type)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}