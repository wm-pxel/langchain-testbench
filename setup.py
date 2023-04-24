from setuptools import setup

setup(
    name='testbench',
    version='0.1.0',
    py_modules=['testbench'],
    install_requires=[
        'Click',
    ],
    entry_points={
        'console_scripts': [
            'testbench = cli:cli',
        ],
    },
)