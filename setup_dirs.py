import os

src_dir = '/home/user/aria-app/src'

components_dir = os.path.join(src_dir, 'components')
views_dir = os.path.join(src_dir, 'views')
data_dir = os.path.join(src_dir, 'data')
utils_dir = os.path.join(src_dir, 'utils')

os.makedirs(components_dir, exist_ok=True)
os.makedirs(views_dir, exist_ok=True)
os.makedirs(data_dir, exist_ok=True)
os.makedirs(utils_dir, exist_ok=True)
