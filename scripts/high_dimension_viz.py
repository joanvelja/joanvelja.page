#!/usr/bin/env python3
"""
High-Dimensional Optimization Visualizations - Refined Version
======================================================

Elegant visualizations for the "An Intuitive Picture" section.
Focuses on geometric intuition with minimal labeling.

Author: Joan Velja
"""

import numpy as np
import matplotlib.pyplot as plt
from matplotlib import cm
from mpl_toolkits.mplot3d import Axes3D
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# Refined color palette: Inspired by Gwern/LessWrong - neutral, academic, subtle
# Dark mode friendly with high contrast
COLORS = {
    'background': '#1a1a1a',  # Dark gray
    'foreground': '#f0f0f0',  # Light gray
    'accent1': '#4a90e2',     # Soft blue
    'accent2': '#50c878',     # Soft green (minima)
    'accent3': '#ff6b6b',     # Soft red (maxima)
    'accent4': '#ffd166',     # Soft yellow (saddles)
    'grid': '#333333'
}

# Set matplotlib style for elegance
plt.rcParams.update({
    'figure.facecolor': COLORS['background'],
    'axes.facecolor': COLORS['background'],
    'axes.edgecolor': COLORS['foreground'],
    'axes.labelcolor': COLORS['foreground'],
    'xtick.color': COLORS['foreground'],
    'ytick.color': COLORS['foreground'],
    'grid.color': COLORS['grid'],
    'grid.alpha': 0.3,
    'text.color': COLORS['foreground'],
    'font.family': 'serif',
    'font.serif': ['Computer Modern Roman'],
    'font.size': 12,
    'axes.titlesize': 16,
    'axes.labelsize': 14,
    'figure.figsize': (10, 6),
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
    'savefig.pad_inches': 0.1
})

def create_1d_landscape():
    """Elegant 1D loss landscape with subtle critical point markers."""
    x = np.linspace(-3, 3, 1000)
    y = 0.3 * x**4 - 1.5 * x**2 + 0.1 * x + 0.5
    
    # Numerical derivatives
    dy = np.gradient(y, x)
    d2y = np.gradient(dy, x)
    
    critical_mask = np.abs(dy) < 0.01
    critical_x = x[critical_mask]
    critical_y = y[critical_mask]
    critical_d2y = d2y[critical_mask]
    
    fig, ax = plt.subplots()
    ax.plot(x, y, color=COLORS['foreground'], linewidth=2)
    
    # Subtle markers
    for cx, cy, curv in zip(critical_x, critical_y, critical_d2y):
        color = COLORS['accent2'] if curv > 0 else COLORS['accent3']
        ax.plot(cx, cy, 'o', color=color, markersize=8, alpha=0.7)
    
    ax.set_xlabel(r'$w$')
    ax.set_ylabel(r'$L(w)$')
    ax.set_title('1D Loss Landscape')
    ax.grid(True)
    
    plt.savefig('1d_landscape.png', facecolor=COLORS['background'])
    plt.close()

def create_2d_landscape():
    """Refined 2D loss surface with clean 3D and contour views."""
    x = np.linspace(-2, 2, 200)
    y = np.linspace(-2, 2, 200)
    X, Y = np.meshgrid(x, y)
    Z = (X**2 - Y**2) * 0.5 + 0.1 * (X**4 + Y**4) - 0.05 * (X**2 + Y**2)
    
    fig = plt.figure(figsize=(12, 6))
    
    # 3D surface
    ax1 = fig.add_subplot(121, projection='3d')
    surf = ax1.plot_surface(X, Y, Z, cmap=cm.viridis, alpha=0.8, 
                            linewidth=0, antialiased=True)
    ax1.set_xlabel(r'$w_1$')
    ax1.set_ylabel(r'$w_2$')
    ax1.set_zlabel(r'$L(w)$')
    ax1.set_title('2D Loss Surface')
    ax1.view_init(elev=30, azim=45)
    ax1.w_xaxis.pane.fill = False
    ax1.w_yaxis.pane.fill = False
    ax1.w_zaxis.pane.fill = False
    
    # Contour
    ax2 = fig.add_subplot(122)
    levels = np.linspace(Z.min(), Z.max(), 20)
    ax2.contourf(X, Y, Z, levels=levels, cmap=cm.viridis, alpha=0.8)
    ax2.contour(X, Y, Z, levels=levels, colors='black', linewidths=0.5, alpha=0.3)
    ax2.set_xlabel(r'$w_1$')
    ax2.set_ylabel(r'$w_2$')
    ax2.set_title('Contour View')
    ax2.set_aspect('equal')
    ax2.grid(False)
    
    plt.tight_layout()
    plt.savefig('2d_landscape.png', facecolor=COLORS['background'])
    plt.close()

def create_dimensionality_curves():
    """Clean curves showing probability decay with dimensionality."""
    dimensions = np.arange(1, 21)
    prob_min = (0.5) ** dimensions
    prob_sad = 1 - 2 * prob_min
    
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 6))
    
    # Linear scale
    ax1.plot(dimensions, prob_min, color=COLORS['accent2'], label='P(Minimum)', linewidth=2)
    ax1.plot(dimensions, prob_sad, color=COLORS['accent4'], label='P(Saddle)', linewidth=2)
    ax1.set_xlabel('Dimensions $N$')
    ax1.set_ylabel('Probability')
    ax1.set_title('Critical Point Probabilities')
    ax1.legend(frameon=False)
    ax1.grid(True)
    
    # Log scale
    ax2.semilogy(dimensions, prob_min, color=COLORS['accent2'], label='P(Minimum)', linewidth=2)
    ax2.semilogy(dimensions, prob_sad, color=COLORS['accent4'], label='P(Saddle)', linewidth=2)
    ax2.set_xlabel('Dimensions $N$')
    ax2.set_ylabel('Probability (log)')
    ax2.set_title('Exponential Decay')
    ax2.legend(frameon=False)
    ax2.grid(True)
    
    plt.tight_layout()
    plt.savefig('dimensionality_curves.png', facecolor=COLORS['background'])
    plt.close()

def create_interactive_high_dim():
    """Interactive Plotly visualization for high-dimensional intuition."""
    dims = np.arange(1, 31)
    prob_min = (0.5) ** dims
    prob_sad = 1 - 2 * prob_min
    
    fig = make_subplots(rows=1, cols=2, 
                        subplot_titles=('Probability (Linear)', 'Probability (Log)'))
    
    # Linear
    fig.add_trace(go.Scatter(x=dims, y=prob_min, name='P(Minimum)', 
                             line=dict(color=COLORS['accent2'], width=3)), row=1, col=1)
    fig.add_trace(go.Scatter(x=dims, y=prob_sad, name='P(Saddle)', 
                             line=dict(color=COLORS['accent4'], width=3)), row=1, col=1)
    
    # Log
    fig.add_trace(go.Scatter(x=dims, y=prob_min, name='P(Minimum)', showlegend=False,
                             line=dict(color=COLORS['accent2'], width=3)), row=1, col=2)
    fig.add_trace(go.Scatter(x=dims, y=prob_sad, name='P(Saddle)', showlegend=False,
                             line=dict(color=COLORS['accent4'], width=3)), row=1, col=2)
    
    fig.update_yaxes(type='log', row=1, col=2)
    fig.update_layout(
        height=500, width=1000,
        title_text='Dimensionality Effects on Critical Points',
        title_x=0.5,
        template='plotly_dark',
        paper_bgcolor=COLORS['background'],
        plot_bgcolor=COLORS['background'],
        font=dict(color=COLORS['foreground'], family='serif'),
        hovermode='x unified'
    )
    fig.update_xaxes(title_text='Dimensions $N$', row=1, col=1)
    fig.update_xaxes(title_text='Dimensions $N$', row=1, col=2)
    fig.update_yaxes(title_text='Probability', row=1, col=1)
    fig.update_yaxes(title_text='Probability (log)', row=1, col=2)
    
    fig.write_html('high_dim_interactive.html')

def main():
    create_1d_landscape()
    create_2d_landscape()
    create_dimensionality_curves()
    create_interactive_high_dim()
    print('Visualizations generated: 1d_landscape.png, 2d_landscape.png, dimensionality_curves.png, high_dim_interactive.html')

if __name__ == '__main__':
    main() 