# https://pypi.org/project/watchdog/
# https://stackoverflow.com/questions/13613336/python-concatenate-text-files
import sys
import json
import time
import logging
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class Bundler():

	# init
	def __init__(self):
		self.config = self.get_config_file()
		self.read_config()

	def get_config_file(self):
		with open('./tools/bundler/config.json') as f:
			data = json.load(f)
			return data
		return None

	def read_config(self):
		if "bundles" not in self.config:
			print("'bundles' not in config")
			sys.exit(0)
		self.bundles = self.config["bundles"]

		if "in" not in self.config:
			print("'in' not in config")
			sys.exit(0)
		self.in_path = self.config["in"]

		if "out" not in self.config:
			print("'out' not in config")
			sys.exit(0)
		self.out_path = self.config["out"]

	# watch path
	def get_watch_path(self):
		return self.in_path

	# write files
	def get_out_file(self, bundle):
		if "out" not in bundle:
			print("'out' not in a bundle")
			sys.exit(0)
		return bundle["out"]

	def get_in_files(self, bundle):
		if "in" not in bundle:
			print("'in' not in a bundle")
			sys.exit(0)
		return bundle["in"]

	def get_comment_type(self, bundle):
		if "comment" not in bundle:
			print("'comment' not in bundle")
			sys.exit(0)
		return bundle["comment"]

	def write_comment(self, fname, comment):
		length = len(fname)
		divider = "=" * length
		return "\n\n" + comment["start"] + " " + divider + " " + comment["end"] + "\n" + comment["start"] + " " + fname + " " + comment["end"] + "\n" + comment["start"] + " " + divider + " " + comment["end"] + "\n\n"

	def write_file(self, in_files, out_file, comment):
		with open(self.out_path + out_file, 'w') as outfile:
			for fname in in_files:
				with open(self.in_path + fname) as in_file:
					outfile.write(self.write_comment(fname, comment))
					for line in in_file:
						outfile.write(line)
		return
	
	def update_bundles(self):
		for bundle in self.bundles:
			in_files = self.get_in_files(bundle)
			out_file = self.get_out_file(bundle)
			comment = self.get_comment_type(bundle)
			self.write_file(in_files, out_file, comment)
		return

class BundleEventHandler(FileSystemEventHandler):
	def __init__(self, bundler):
		self.bundler = bundler
	
	def update_bundles(self):
		self.bundler.update_bundles()
		return

	# event
	def on_moved(self, event):
		super(BundleEventHandler, self).on_moved(event)
		what = 'directory' if event.is_directory else 'file'
		logging.info("Moved %s: from %s to %s", what, event.src_path,
					 event.dest_path)
		self.update_bundles()

	def on_created(self, event):
		super(BundleEventHandler, self).on_created(event)
		what = 'directory' if event.is_directory else 'file'
		logging.info("Created %s: %s", what, event.src_path)
		self.update_bundles()

	def on_deleted(self, event):
		super(BundleEventHandler, self).on_deleted(event)
		what = 'directory' if event.is_directory else 'file'
		logging.info("Deleted %s: %s", what, event.src_path)
		self.update_bundles()

	def on_modified(self, event):
		super(BundleEventHandler, self).on_modified(event)
		what = 'directory' if event.is_directory else 'file'
		logging.info("Modified %s: %s", what, event.src_path)
		self.update_bundles()


if __name__ == "__main__":

	logging.basicConfig(level=logging.INFO,
						format='%(asctime)s - %(message)s',
						datefmt='%Y-%m-%d %H:%M:%S')

	bundler = Bundler()
	bundler.update_bundles()
	logging.info("Updated all bundles")

	event_handler = BundleEventHandler(bundler)
	observer = Observer()
	observer.schedule(event_handler, bundler.get_watch_path(), recursive=True)
	observer.start()

	try:
		while True:
			time.sleep(1000)
	except KeyboardInterrupt:
		observer.stop()
		
	observer.join()
